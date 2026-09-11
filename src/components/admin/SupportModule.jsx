import React, { useState } from 'react';
import {
  LifeBuoy,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Phone,
  Mail,
  Send,
  Trash2,
  Filter
} from 'lucide-react';
import supportService from '../../services/supportService';
import ConfirmModal from '../common/ConfirmModal';

export default function SupportModule({
  tickets = [],
  setTickets,
  showToast,
  auditLog
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, ticketId: null, subject: '' });

  const filteredTickets = tickets.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.phone && t.phone.toLowerCase().includes(q)) ||
      (t.customerPhone && t.customerPhone.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.message && t.message.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id, newStatus, subject) => {
    supportService.updateTicketStatus(id, newStatus);
    setTickets(supportService.getTickets());
    showToast(`Ticket status updated to ${newStatus.toUpperCase()}`, 'info');
    if (auditLog) {
      auditLog('UPDATE_SUPPORT_TICKET', `Ticket #${id}`, `Changed ticket status to ${newStatus}`);
    }
  };

  const handleSendResponse = (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    supportService.addResponse(selectedTicket.id, replyText);
    const updated = supportService.getTickets();
    setTickets(updated);
    setSelectedTicket(updated.find(t => t.id === selectedTicket.id));
    setReplyText('');
    showToast('Resolution response logged & dispatched', 'success');
    if (auditLog) {
      auditLog('RESOLVE_SUPPORT_TICKET', `Ticket #${selectedTicket.id}`, `Sent resolution to customer`);
    }
  };

  const handleDelete = (id, subject) => {
    setDeleteConfirm({ isOpen: true, ticketId: id, subject: subject || id });
  };

  const confirmDeleteTicketAction = () => {
    const { ticketId, subject } = deleteConfirm;
    if (!ticketId) return;
    supportService.deleteTicket(ticketId);
    setTickets(supportService.getTickets());
    if (selectedTicket?.id === ticketId) setSelectedTicket(null);
    showToast('Support ticket deleted', 'info');
    if (auditLog) {
      auditLog('DELETE_SUPPORT_TICKET', `Ticket #${ticketId}`, `Deleted ticket "${subject}"`);
    }
    setDeleteConfirm({ isOpen: false, ticketId: null, subject: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-blue-600" />
            <span>Customer Helpdesk & Support Resolution Desk</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Handle customer inquiries, return requests, payment disputes, and WhatsApp concierge inquiries
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
            {tickets.filter(t => t.status === 'open').length} Open Tickets
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {tickets.filter(t => t.status === 'resolved').length} Resolved
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket subject, customer name, mobile number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {['all', 'open', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl font-bold uppercase font-mono transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-neutral-400 border border-neutral-200/80 shadow-xs">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
              <p className="font-bold text-neutral-700 text-sm">Inbox Zero! No outstanding tickets</p>
              <p className="text-xs">Customer support inquiries will be logged here</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              const statusColors = {
                open: 'bg-amber-50 text-amber-700 border-amber-200',
                in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
                resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
              };

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white rounded-2xl p-5 border transition cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-md'
                      : 'border-neutral-200/80 hover:border-neutral-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-neutral-500">#{ticket.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${statusColors[ticket.status] || 'bg-neutral-100'}`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                      {ticket.priority === 'urgent' && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                          🔥 Urgent
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-neutral-900">{ticket.subject}</h3>
                  <p className="text-xs text-neutral-600 line-clamp-2">{ticket.message}</p>

                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-100">
                    <span className="font-medium text-neutral-700">{ticket.name} • {ticket.phone || ticket.email}</span>
                    <span className="font-mono text-[11px] text-rose-600 font-bold">Click to resolve ➔</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resolution Drawer Panel */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 flex flex-col justify-between">
          {selectedTicket ? (
            <div className="space-y-4 text-xs">
              <div className="border-b border-neutral-100 pb-3">
                <span className="font-mono text-[10px] text-neutral-400 uppercase">Selected Ticket</span>
                <h3 className="font-serif font-black text-base text-neutral-900 mt-0.5">{selectedTicket.subject}</h3>
                <p className="text-neutral-500 mt-1">From: <strong className="text-neutral-800">{selectedTicket.name}</strong> ({selectedTicket.phone || selectedTicket.email})</p>
              </div>

              {/* Inquiry Message */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-1">
                <span className="font-bold text-neutral-700 text-[11px]">Customer Inquiry:</span>
                <p className="text-neutral-700 leading-relaxed">{selectedTicket.message}</p>
              </div>

              {/* Status Switcher */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Update Ticket Status:</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value, selectedTicket.subject)}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 font-bold text-xs uppercase font-mono"
                >
                  <option value="open">Open / Pending Review</option>
                  <option value="in_progress">In Progress / Contacted</option>
                  <option value="resolved">Resolved & Closed</option>
                </select>
              </div>

              {/* Resolution Form */}
              <form onSubmit={handleSendResponse} className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block font-bold text-neutral-700">Internal Resolution Note / Reply:</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Record call details, WhatsApp solution, replacement SKU sent..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Resolution</span>
                </button>
              </form>

              <div className="pt-2 border-t border-neutral-100 flex justify-end">
                <button
                  onClick={() => handleDelete(selectedTicket.id, selectedTicket.subject)}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1 text-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Ticket</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <p className="font-bold text-neutral-600 text-xs">No Ticket Selected</p>
              <p className="text-[11px]">Select a ticket from the left queue to view details and dispatch resolution</p>
            </div>
          )}
        </div>
      </div>

      {/* Safe Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Support Ticket?"
        message={`Are you sure you want to permanently delete support ticket "${deleteConfirm.subject}"? This conversation history cannot be retrieved.`}
        confirmText="Yes, Delete Ticket"
        cancelText="Keep Ticket"
        confirmVariant="danger"
        onConfirm={confirmDeleteTicketAction}
        onClose={() => setDeleteConfirm({ isOpen: false, ticketId: null, subject: '' })}
      />
    </div>
  );
}
