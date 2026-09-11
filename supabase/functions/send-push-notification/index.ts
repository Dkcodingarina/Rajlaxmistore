// Supabase Edge Function: send-push-notification
// Deploy with: supabase functions deploy send-push-notification
// Set secrets with: supabase secrets set VAPID_PRIVATE_KEY="your_private_key" VAPID_PUBLIC_KEY="your_public_key" VAPID_SUBJECT="mailto:admin@rajlaxmi.com"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@rajlaxmi.com';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify Request Body
    const { notificationId } = await req.json();
    if (!notificationId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing notificationId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch Notification Campaign
    const { data: notification, error: fetchErr } = await supabase
      .from('push_notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (fetchErr || !notification) {
      return new Response(
        JSON.stringify({ success: false, error: 'Notification campaign record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Lock Status to SENDING
    await supabase
      .from('push_notifications')
      .update({ status: 'SENDING', updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    // 4. Fetch Active Eligible Push Subscriptions
    const { data: subscriptions, error: subErr } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('enabled', true);

    if (subErr || !subscriptions || subscriptions.length === 0) {
      // Mark as SENT with 0 recipients
      await supabase
        .from('push_notifications')
        .update({
          status: 'SENT',
          sent_at: new Date().toISOString(),
          recipient_count: 0,
          success_count: 0,
          failure_count: 0
        })
        .eq('id', notificationId);

      return new Response(
        JSON.stringify({
          success: true,
          status: 'SENT',
          totalRecipients: 0,
          successCount: 0,
          failureCount: 0,
          message: 'No active eligible subscriptions found.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      imageUrl: notification.image_url,
      targetUrl: notification.target_url || '/',
      notificationId: notification.id
    });

    let successCount = 0;
    let failureCount = 0;
    const invalidSubscriptionIds: string[] = [];

    // 5. Send Web Push to Each Active Subscription
    for (const sub of subscriptions) {
      try {
        // Prepare endpoint dispatch or web-push headers
        const res = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400'
          },
          body: payload
        });

        if (res.ok || res.status === 201 || res.status === 202) {
          successCount++;
        } else if (res.status === 404 || res.status === 410) {
          // Subscription expired or unregistered -> mark for cleanup
          failureCount++;
          invalidSubscriptionIds.push(sub.id);
        } else {
          failureCount++;
        }
      } catch (err) {
        failureCount++;
      }
    }

    // 6. Cleanup Invalid Subscriptions
    if (invalidSubscriptionIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', invalidSubscriptionIds);
    }

    // 7. Update Notification Campaign Final Status
    const totalRecipients = subscriptions.length;
    const finalStatus = failureCount === 0 ? 'SENT' : (successCount > 0 ? 'PARTIALLY_SENT' : 'FAILED');

    await supabase
      .from('push_notifications')
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        recipient_count: totalRecipients,
        success_count: successCount,
        failure_count: failureCount
      })
      .eq('id', notificationId);

    return new Response(
      JSON.stringify({
        success: true,
        status: finalStatus,
        totalRecipients,
        successCount,
        failureCount,
        cleanedInvalidSubscriptions: invalidSubscriptionIds.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal Edge Function error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
