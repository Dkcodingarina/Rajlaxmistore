import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import supportService from '../../services/supportService';
import {
  MessageSquare,
  X,
  Send,
  HelpCircle,
  Phone,
  Mail,
  User,
  ShoppingBag,
  MessageCircle,
  Clock,
  Check,
  ChevronLeft,
  LifeBuoy
} from 'lucide-react';

export default function SupportWidget() {
  const { user, showToast, storeSettings, currentView } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [ticketList, setTicketList] = useState([]);
  const [view, setView] = useState('menu'); // 'menu' | 'new' | 'list' | 'chat'
  
  // Form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Product Inquiry',
    orderNumber: '',
    message: ''
  });
  
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef(null);

  // Sync user details if logged in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Load customer's ticket list
  const loadTickets = () => {
    let list = [];
    if (user) {
      list = supportService.getTicketsByCustomer(user.email || user.phone);
    } else {
      // For guest, check local storage for saved guest ticket IDs or matched email/phone
      const guestTicketIds = JSON.parse(localStorage.getItem('guest_support_ticket_ids') || '[]');
      const all = supportService.getTickets();
      list = all.filter(t => {
        if (guestTicketIds.includes(t.id)) return true;
        if (form.email && t.customerEmail && t.customerEmail.toLowerCase() === form.email.toLowerCase()) return true;
        if (form.phone && t.customerPhone && t.customerPhone.replace(/\D/g, '').includes(form.phone.replace(/\D/g, ''))) return true;
        return false;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setTicketList(list);
    
    // If we have an active chat open, update it with fresh data
    if (activeTicket) {
      const fresh = supportService.getTickets().find(t => t.id === activeTicket.id);
      if (fresh) setActiveTicket(fresh);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen, user]);

  // Auto scroll to chat bottom
  useEffect(() => {
    if (activeTicket && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket, view]);

  // Listen to admin reply updates to refresh conversation
  useEffect(() => {
    const handleUpdate = () => {
      loadTickets();
    };
    window.addEventListener('storage', handleUpdate);
    // Also listen to custom storage updates within same tab
    const interval = setInterval(() => {
      if (isOpen) loadTickets();
    }, 4000);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [isOpen, activeTicket]);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      showToast('Please fill out Name and Message.', 'error');
      return;
    }

    const newTicket = supportService.createTicket({
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      category: form.category,
      orderNumber: form.orderNumber,
      message: form.message
    });

    if (!user) {
      // Save ticket ID in guest session list
      const guestTicketIds = JSON.parse(localStorage.getItem('guest_support_ticket_ids') || '[]');
      guestTicketIds.push(newTicket.id);
      localStorage.setItem('guest_support_ticket_ids', JSON.stringify(guestTicketIds));
    }

    showToast(`Support ticket #${newTicket.ticketNumber} created!`, 'success');
    
    // Set to newly created chat
    setActiveTicket(newTicket);
    setForm(prev => ({ ...prev, message: '', orderNumber: '' })); // clear message
    setView('chat');
    loadTickets();
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeTicket) return;

    const updated = supportService.addCustomerFollowup(activeTicket.id, chatMessage);
    if (updated) {
      setActiveTicket(updated);
      setChatMessage('');
      loadTickets();
    }
  };

  if (currentView === 'my-orders') return null;

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-5 sm:right-5 z-50 font-sans">
      {/* Floating Chat Button */}
      <button
        id="btn_support_widget"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 flex items-center justify-center text-white shadow-2xl hover:scale-105 transition-transform cursor-pointer relative group border-2 border-white"
        title="Contact Store Support"
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
        {/* Unread dot or accent badge */}
        {!isOpen && ticketList.some(t => t.status === 'replied') && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
        )}
      </button>

      {/* Support Chat Dialog */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-20 sm:inset-auto sm:absolute sm:bottom-16 sm:right-0 sm:w-[380px] max-h-[calc(100vh-140px)] sm:max-h-[520px] h-[480px] bg-white rounded-3xl border border-neutral-200/80 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-900 to-rose-950 p-3.5 sm:p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-inner">
                <LifeBuoy className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">Help & Customer Support</h4>
                <p className="text-[10px] text-amber-200 font-medium">We reply instantly on working hours</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body views */}
          <div className="flex-1 overflow-y-auto bg-neutral-50 p-4">
            
            {/* 1. MAIN MENU VIEW */}
            {view === 'menu' && (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-neutral-200/60 shadow-xs space-y-2">
                  <h5 className="font-bold text-xs text-neutral-500 uppercase tracking-wider">How can we help you?</h5>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Welcome to our support center! Submit a query regarding your order status, delivery, cosmetics questions or any stationery bulk quotes.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setView('new')}
                    className="w-full p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-neutral-200 hover:border-rose-200 transition flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-black text-neutral-900">Create New Ticket</span>
                        <span className="text-[10px] text-neutral-500">Ask a question to our experts</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-600 group-hover:translate-x-1 transition-transform">🚀</span>
                  </button>

                  <button
                    onClick={() => { setView('list'); loadTickets(); }}
                    className="w-full p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-neutral-200 hover:border-rose-200 transition flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-black text-neutral-900">Track Past Queries</span>
                        <span className="text-[10px] text-neutral-500">Check replies to your ({ticketList.length}) tickets</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-400 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>

                {/* Direct Whatsapp Quick Link */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-extrabold text-emerald-950">Prefer Quick Chat?</span>
                    <span className="text-[10px] text-emerald-700">Chat directly with us on WhatsApp</span>
                  </div>
                  <a
                    href={`https://wa.me/${storeSettings.whatsappNumber || '919879543210'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center space-x-1 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* 2. CREATE NEW TICKET VIEW */}
            {view === 'new' && (
              <form onSubmit={handleSubmitTicket} className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setView('menu')}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-900 flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <span className="text-xs font-bold text-neutral-700">New Inquiry</span>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">Your Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                      placeholder="e.g. Priya Sharma"
                    />
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">Email (Optional)</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                        placeholder="priya@example.com"
                      />
                      <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">Phone *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                        placeholder="9876543210"
                      />
                      <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">Inquiry Topic</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full p-2 bg-white rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                    >
                      <option>Delivery Update</option>
                      <option>Product Inquiry</option>
                      <option>Order Issue</option>
                      <option>Bulk Stationery Discount</option>
                      <option>Other / Suggestions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">Order # (Optional)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.orderNumber}
                        onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                        placeholder="e.g. RLX-4812"
                      />
                      <ShoppingBag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-rose-500 outline-none resize-none"
                    placeholder="Write details of your issue/query..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </form>
            )}

            {/* 3. TICKET LIST / TRACK VIEW */}
            {view === 'list' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
                  <button
                    onClick={() => setView('menu')}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-900 flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <span className="text-xs font-bold text-neutral-700">Track Tickets</span>
                </div>

                {ticketList.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <span className="text-2xl">🔍</span>
                    <p className="text-xs font-bold text-neutral-500">No support tickets found</p>
                    <p className="text-[10px] text-neutral-400">Created tickets will show up here to track replies.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {ticketList.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => { setActiveTicket(ticket); setView('chat'); }}
                        className="w-full p-3 bg-white hover:bg-rose-50/20 rounded-xl border border-neutral-200 hover:border-rose-200 text-left transition flex justify-between items-start gap-2"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-[10px] font-bold text-rose-700">#{ticket.ticketNumber}</span>
                            <span className="text-[9px] text-neutral-400">• {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className="block text-xs font-black text-neutral-900 truncate">{ticket.category}</span>
                          <p className="text-[10px] text-neutral-500 truncate">{ticket.messages[ticket.messages.length - 1]?.text}</p>
                        </div>

                        <div>
                          {ticket.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase">Pending</span>
                          ) : ticket.status === 'replied' ? (
                            <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase animate-pulse">Replied</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-neutral-100 text-neutral-600 border border-neutral-200 uppercase">Closed</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. ACTIVE CONVERSATION / CHAT VIEW */}
            {view === 'chat' && activeTicket && (
              <div className="flex flex-col h-full animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 mb-2 shrink-0">
                  <button
                    onClick={() => setView('list')}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-900 flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to List</span>
                  </button>
                  <span className="font-mono text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full">
                    #{activeTicket.ticketNumber}
                  </span>
                </div>

                {/* Ticket Details summary */}
                <div className="bg-white rounded-xl p-2.5 border border-neutral-100 shadow-2xs space-y-1 mb-2.5 shrink-0 text-[10px]">
                  <div className="flex justify-between">
                    <span className="font-bold text-neutral-500">Category:</span>
                    <span className="font-bold text-neutral-900">{activeTicket.category}</span>
                  </div>
                  {activeTicket.orderNumber && (
                    <div className="flex justify-between">
                      <span className="font-bold text-neutral-500">Order Reference:</span>
                      <span className="font-mono text-neutral-900">#{activeTicket.orderNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-bold text-neutral-500">Status:</span>
                    <span className={`font-bold capitalize ${activeTicket.status === 'replied' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {activeTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Chat Message Stream */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2 max-h-[220px]">
                  {activeTicket.messages.map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                      >
                        <div className="text-[8px] font-bold text-neutral-400 mb-0.5 px-1">
                          {isAdmin ? 'Store Support Admin' : 'You'}
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl p-2.5 text-xs leading-relaxed shadow-3xs ${
                            isAdmin
                              ? 'bg-white text-neutral-900 border border-neutral-200/80 rounded-tl-none'
                              : 'bg-rose-600 text-white rounded-tr-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className="text-[8px] text-neutral-400 mt-0.5 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Send Reply Form */}
                <form onSubmit={handleSendChatMessage} className="flex gap-1.5 pt-2 border-t border-neutral-200 shrink-0">
                  <input
                    type="text"
                    required
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your message reply..."
                    className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition shrink-0 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Footer info branding */}
          <div className="bg-neutral-50 p-2.5 border-t border-neutral-200/60 text-center text-[9px] text-neutral-400 uppercase tracking-wider shrink-0">
            Secure Support Console • {storeSettings.storeName || 'Store'}
          </div>
        </div>
      )}
    </div>
  );
}
