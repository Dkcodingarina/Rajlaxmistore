import React, { useState } from 'react';
import {
  PartyPopper,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Tag,
  CheckCircle,
  AlertCircle,
  Eye,
  Percent,
  Layers,
  Save,
  Package
} from 'lucide-react';
import festivalService from '../../services/festivalService';
import ImageUploadDropzone from '../common/ImageUploadDropzone';
import ConfirmModal from '../common/ConfirmModal';

export default function CampaignsModule({
  festivals = [],
  setFestivals,
  products = [],
  showToast,
  auditLog
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, campaignId: null, campaignName: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    slug: '',
    description: '',
    discountText: 'Flat 25% OFF',
    discountPercentage: 25,
    banner: '',
    thumbnail: '',
    themeColor: '#D97706',
    startDate: '',
    endDate: '',
    status: 'active',
    priority: 1
  });

  const activeCampaign = festivals.find(f => f.status === 'active');

  const handleOpenModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        name: campaign.name || '',
        slug: campaign.slug || '',
        description: campaign.description || '',
        discountText: campaign.discountText || 'Flat 25% OFF',
        discountPercentage: campaign.discountPercentage || 25,
        banner: campaign.banner || '',
        thumbnail: campaign.thumbnail || '',
        themeColor: campaign.themeColor || '#D97706',
        startDate: campaign.startDate || '',
        endDate: campaign.endDate || '',
        status: campaign.status || 'active',
        priority: campaign.priority || 1
      });
    } else {
      setEditingCampaign(null);
      const generatedSlug = `festive-${Date.now().toString().slice(-4)}`;
      setCampaignForm({
        name: '',
        slug: generatedSlug,
        description: '',
        discountText: 'Flat 20% OFF',
        discountPercentage: 20,
        banner: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=400&auto=format&fit=crop&q=80',
        themeColor: '#e11d48',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
        status: 'active',
        priority: (festivals.length || 0) + 1
      });
    }
    setShowModal(true);
  };

  const handleSaveCampaign = (e) => {
    e.preventDefault();
    if (!campaignForm.name.trim()) {
      showToast('Campaign title is required', 'error');
      return;
    }

    const payload = {
      ...campaignForm,
      slug: campaignForm.slug || campaignForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };

    if (editingCampaign) {
      festivalService.updateFestival(editingCampaign.id, payload);
      setFestivals(festivalService.getFestivals());
      showToast(`Campaign "${payload.name}" updated`, 'success');
      if (auditLog) {
        auditLog('UPDATE_CAMPAIGN', payload.name, `Updated festive campaign details & schedule`);
      }
    } else {
      festivalService.createFestival(payload);
      setFestivals(festivalService.getFestivals());
      showToast(`New campaign "${payload.name}" created and active`, 'success');
      if (auditLog) {
        auditLog('CREATE_CAMPAIGN', payload.name, `Created seasonal campaign offering ${payload.discountText}`);
      }
    }
    setShowModal(false);
  };

  const handleDeleteCampaign = (id, name) => {
    setDeleteConfirm({ isOpen: true, campaignId: id, campaignName: name });
  };

  const confirmDeleteCampaignAction = () => {
    const { campaignId, campaignName } = deleteConfirm;
    if (!campaignId) return;
    festivalService.deleteFestival(campaignId);
    setFestivals(festivalService.getFestivals());
    showToast(`Campaign "${campaignName}" deleted`, 'info');
    if (auditLog) {
      auditLog('DELETE_CAMPAIGN', campaignName, 'Removed festive campaign');
    }
    setDeleteConfirm({ isOpen: false, campaignId: null, campaignName: '' });
  };

  const handleToggleStatus = (id, currentStatus, name) => {
    if (currentStatus === 'active') {
      festivalService.deactivateFestival(id);
      setFestivals(festivalService.getFestivals());
      showToast(`Campaign "${name}" turned OFF. Website is now in Normal Mode!`, 'info');
      if (auditLog) {
        auditLog('TOGGLE_CAMPAIGN', name, 'Turned off campaign - Website in normal mode');
      }
    } else {
      festivalService.activateFestival(id);
      setFestivals(festivalService.getFestivals());
      showToast(`Campaign "${name}" is now LIVE on the Website!`, 'success');
      if (auditLog) {
        auditLog('TOGGLE_CAMPAIGN', name, 'Activated campaign on website');
      }
    }
  };

  const handleTurnOffAll = () => {
    festivalService.pauseAllFestivals();
    setFestivals(festivalService.getFestivals());
    showToast('All campaigns turned OFF. Website returned to Normal Mode.', 'info');
    if (auditLog) {
      auditLog('PAUSE_ALL_CAMPAIGNS', 'Website', 'Set website to normal default mode');
    }
  };

  const filteredFestivals = festivals.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Live Status Control Banner */}
      <div className={`p-5 rounded-2xl border transition shadow-sm ${
        activeCampaign
          ? 'bg-gradient-to-r from-emerald-950 to-neutral-900 border-emerald-500/50 text-white'
          : 'bg-neutral-50 border-neutral-200 text-neutral-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              activeCampaign ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-neutral-200 text-neutral-600'
            }`}>
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  activeCampaign ? 'bg-emerald-400 text-emerald-950 font-mono' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {activeCampaign ? 'LIVE ON STOREFRONT' : 'NORMAL WEBSITE MODE'}
                </span>
                {activeCampaign && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Active Now
                  </span>
                )}
              </div>
              <h3 className="font-serif font-black text-lg sm:text-xl mt-0.5">
                {activeCampaign ? activeCampaign.name : 'Standard Storefront (No Active Campaign)'}
              </h3>
              <p className="text-xs opacity-80 max-w-xl">
                {activeCampaign
                  ? `Website visitors currently see "${activeCampaign.name}" hero banner, deals, and special collection.`
                  : 'The website is displaying regular cosmetics & stationery banners. Click "Activate on Website" on any festival below to turn on festive mode.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeCampaign && (
              <button
                type="button"
                onClick={handleTurnOffAll}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
              >
                Turn OFF Campaign (Normal Mode)
              </button>
            )}
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Campaign</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">
            All Festivals & Seasonal Campaigns ({filteredFestivals.length})
          </h2>
          <p className="text-xs text-neutral-500">
            Toggle any campaign below to instantly transform your storefront.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search festivals (e.g. Diwali, Holi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFestivals.map((campaign) => {
          const isLive = campaign.status === 'active';
          const assignedCount = products.filter(p => 
            (p.festivalSlug && p.festivalSlug === campaign.slug) || 
            (Array.isArray(p.festivals) && p.festivals.includes(campaign.slug))
          ).length;

          return (
            <div
              key={campaign.id}
              className={`bg-white rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-lg transition group ${
                isLive ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-neutral-200/80'
              }`}
            >
              {/* Campaign Header & Hero Banner */}
              <div className="h-48 w-full relative overflow-hidden bg-neutral-900">
                <img
                  src={campaign.banner || campaign.thumbnail || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800'}
                  alt={campaign.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent p-5 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-mono font-black shadow-md uppercase tracking-wider"
                      style={{ backgroundColor: campaign.themeColor || '#D97706' }}
                    >
                      {campaign.discountText || 'Special Drop'}
                    </span>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border font-mono ${
                      isLive
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    }`}>
                      {isLive ? '🟢 LIVE ON STORE' : '⚪ OFF'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-black text-xl leading-tight text-white">{campaign.name}</h3>
                    <p className="text-xs text-neutral-200 line-clamp-1 mt-1">{campaign.description}</p>
                  </div>
                </div>
              </div>

              {/* Campaign Meta Details */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                    <span className="text-[10px] text-neutral-400 font-mono uppercase block">Assigned Products</span>
                    <span className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 mt-0.5">
                      <Package className="w-3.5 h-3.5 text-rose-500" />
                      <span>{assignedCount} SKUs Linked</span>
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                    <span className="text-[10px] text-neutral-400 font-mono uppercase block">Campaign Slug</span>
                    <span className="font-mono font-bold text-neutral-800 text-xs truncate block mt-0.5">
                      /{campaign.slug}
                    </span>
                  </div>
                </div>

                {/* Dates & Timeline */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{campaign.startDate || 'Season'} – {campaign.endDate || 'Drop'}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(campaign.id, campaign.status, campaign.name)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs text-center ${
                        isLive
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                      }`}
                    >
                      {isLive ? 'Turn OFF' : 'Activate on Website'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(campaign)}
                      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer shrink-0"
                      title="Edit Campaign"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                      className="p-2 rounded-lg bg-neutral-100 hover:bg-rose-100 text-rose-600 transition cursor-pointer shrink-0"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
              <div>
                <h3 className="font-serif font-black text-xl text-neutral-900">
                  {editingCampaign ? 'Edit Seasonal Campaign' : 'Launch New Seasonal Campaign'}
                </h3>
                <p className="text-xs text-neutral-500">Set campaign discount banner, dates and theme palette</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Diwali Festive Dhamaka 2026"
                  value={campaignForm.name || ''}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">URL Identifier / Slug</label>
                  <input
                    type="text"
                    placeholder="e.g., diwali-dhamaka"
                    value={campaignForm.slug || ''}
                    onChange={(e) => setCampaignForm({ ...campaignForm, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Discount Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g., Flat 25% OFF"
                    value={campaignForm.discountText || ''}
                    onChange={(e) => setCampaignForm({ ...campaignForm, discountText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Campaign Description</label>
                <textarea
                  rows="2"
                  placeholder="e.g., Exclusive gift hampers, premium cosmetics and school stationery with festive savings"
                  value={campaignForm.description || ''}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={campaignForm.startDate || ''}
                    onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={campaignForm.endDate || ''}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Theme Accent Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={campaignForm.themeColor || '#D97706'}
                      onChange={(e) => setCampaignForm({ ...campaignForm, themeColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer p-0.5 border border-neutral-300"
                    />
                    <input
                      type="text"
                      value={campaignForm.themeColor || ''}
                      onChange={(e) => setCampaignForm({ ...campaignForm, themeColor: e.target.value })}
                      className="w-full px-2 py-2 bg-neutral-50 rounded-xl border border-neutral-300 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Campaign Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={campaignForm.banner || ''}
                  onChange={(e) => setCampaignForm({ ...campaignForm, banner: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
                <div className="mt-2">
                  <ImageUploadDropzone
                    label="Upload high-res campaign banner"
                    onImageUploaded={(url) => setCampaignForm({ ...campaignForm, banner: url })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Festival Campaign?"
        message={`Are you sure you want to delete campaign "${deleteConfirm.campaignName}"? Any promotional tags and theme styles linked to this campaign will be removed.`}
        confirmText="Yes, Delete Campaign"
        cancelText="Keep Campaign"
        confirmVariant="danger"
        onConfirm={confirmDeleteCampaignAction}
        onClose={() => setDeleteConfirm({ isOpen: false, campaignId: null, campaignName: '' })}
      />
    </div>
  );
}
