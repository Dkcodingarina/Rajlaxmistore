import storage from '../utils/storage';
import notificationService from './notificationService';

const INITIAL_TICKETS = [
  {
    id: 'tkt-101',
    ticketNumber: 'SUP-9821',
    customerName: 'Priya Verma',
    customerEmail: 'priya.v@gmail.com',
    customerPhone: '+91 98765 12345',
    category: 'Delivery Update',
    orderNumber: 'RLX-2026-00108',
    status: 'pending', // 'pending' | 'in_progress' | 'replied' | 'resolved'
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Priya Verma',
        text: 'Hello, I placed an order yesterday for cosmetics. When can I expect doorstep delivery in Rajkot?',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      }
    ]
  },
  {
    id: 'tkt-102',
    ticketNumber: 'SUP-9822',
    customerName: 'Amit Patel',
    customerEmail: 'amit.patel@hotmail.com',
    customerPhone: '+91 98250 88990',
    category: 'Product Inquiry',
    orderNumber: '',
    status: 'replied',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Amit Patel',
        text: 'Do you have bulk stationery discounts for school office supplies?',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString()
      },
      {
        id: 'msg-2',
        sender: 'admin',
        senderName: 'Rajlaxmi Store Manager',
        text: 'Hello Amit! Yes, we offer special bulk discounts on school stationery. Please contact us on WhatsApp at +91 98795 43210 for a custom quote.',
        timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString()
      }
    ]
  }
];

export const supportService = {
  getTickets: () => {
    return storage.get('support_tickets', INITIAL_TICKETS);
  },

  getTicketsByCustomer: (emailOrPhone) => {
    const list = storage.get('support_tickets', INITIAL_TICKETS);
    if (!emailOrPhone) return list;
    const cleanStr = emailOrPhone.toString().toLowerCase().trim();
    const cleanPhone = cleanStr.replace(/\D/g, '');

    return list.filter(t => {
      const tEmail = (t.customerEmail || '').toLowerCase();
      const tPhone = (t.customerPhone || '').replace(/\D/g, '');
      return tEmail === cleanStr || (cleanPhone && tPhone.includes(cleanPhone));
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createTicket: ({ customerName, customerEmail, customerPhone, category, orderNumber, message }) => {
    const list = storage.get('support_tickets', INITIAL_TICKETS);
    const ticketNumber = 'SUP-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      id: 'tkt-' + Date.now(),
      ticketNumber,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      category: category || 'General Support',
      orderNumber: orderNumber || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'customer',
          senderName: customerName || 'Customer',
          text: message,
          timestamp: new Date().toISOString()
        }
      ]
    };

    list.unshift(newTicket);
    storage.set('support_tickets', list);

    // Trigger Admin Notification for Support Query!
    notificationService.addNotification({
      type: 'support',
      title: '💬 New Support Message Received',
      message: `${customerName || 'A customer'} sent a query regarding "${category}": "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
      linkTab: 'support',
      data: { ticketId: newTicket.id, ticketNumber }
    });

    return newTicket;
  },

  replyToTicket: (ticketId, replyText, adminName = 'Store Support Admin', newStatus = 'replied') => {
    const list = storage.get('support_tickets', INITIAL_TICKETS);
    const idx = list.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      const replyMsg = {
        id: 'msg-' + Date.now(),
        sender: 'admin',
        senderName: adminName,
        text: replyText,
        timestamp: new Date().toISOString()
      };
      list[idx].messages.push(replyMsg);
      list[idx].status = newStatus;
      storage.set('support_tickets', list);
      return list[idx];
    }
    return null;
  },

  addAdminReply: function(ticketId, replyText, adminName = 'Store Support Admin', newStatus = 'replied') {
    return this.replyToTicket(ticketId, replyText, adminName, newStatus);
  },

  addCustomerFollowup: (ticketId, messageText) => {
    const list = storage.get('support_tickets', INITIAL_TICKETS);
    const idx = list.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      const msg = {
        id: 'msg-' + Date.now(),
        sender: 'customer',
        senderName: list[idx].customerName || 'Customer',
        text: messageText,
        timestamp: new Date().toISOString()
      };
      list[idx].messages.push(msg);
      list[idx].status = 'pending'; // Re-open for admin attention
      storage.set('support_tickets', list);

      // Trigger admin notification for follow-up
      notificationService.addNotification({
        type: 'support',
        title: `💬 Support Follow-up on #${list[idx].ticketNumber}`,
        message: `${list[idx].customerName}: "${messageText.slice(0, 60)}${messageText.length > 60 ? '...' : ''}"`,
        linkTab: 'support',
        data: { ticketId, ticketNumber: list[idx].ticketNumber }
      });

      return list[idx];
    }
    return null;
  },

  updateTicketStatus: (ticketId, status) => {
    const list = storage.get('support_tickets', INITIAL_TICKETS);
    const idx = list.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      list[idx].status = status;
      storage.set('support_tickets', list);
      return list[idx];
    }
    return null;
  },

  deleteTicket: (ticketId) => {
    const list = storage.get('support_tickets', INITIAL_TICKETS);
    const filtered = list.filter(t => t.id !== ticketId);
    storage.set('support_tickets', filtered);
    return true;
  },

  addResponse: function(ticketId, replyText, adminName = 'Store Support Admin', newStatus = 'resolved') {
    return this.replyToTicket(ticketId, replyText, adminName, newStatus);
  }
};

export default supportService;
