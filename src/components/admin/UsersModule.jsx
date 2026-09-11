import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  ShoppingBag,
  Plus,
  Trash2,
  Lock,
  Unlock,
  UserX,
  CheckCircle2,
  X,
  Eye,
  Ban,
  Clock
} from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import customerService from '../../services/customerService';

export default function UsersModule({
  customers = [],
  setCustomers,
  orders = [],
  showToast,
  auditLog
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'staff'

  // Selected customer for detail drawer/modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Local overrides for customer status and deletion
  const [blockedCustomerIds, setBlockedCustomerIds] = useState(() => new Set());
  const [deletedCustomerIds, setDeletedCustomerIds] = useState(() => new Set());

  // Confirm delete customer modal state
  const [deleteCustomerConfirm, setDeleteCustomerConfirm] = useState({
    isOpen: false,
    customerId: null,
    customerName: ''
  });

  // Admin Team Staff
  const [staffList, setStaffList] = useState([
    { id: 'usr-1', name: 'Store Super Admin', email: 'admin@rajlaxmistore.com', role: 'Super Admin', status: 'Active', access: 'Full Root Access' }
  ]);

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    role: 'Catalog Manager',
    access: 'Products, Banners & Categories'
  });

  const [deleteStaffConfirm, setDeleteStaffConfirm] = useState({
    isOpen: false,
    staffId: null,
    staffName: ''
  });

  // Aggregate Customer Stats from actual store data
  const enrichedCustomers = useMemo(() => {
    const map = new Map();

    // 1. First add all registered customer profiles
    if (Array.isArray(customers)) {
      customers.forEach((c, idx) => {
        const key = (c.phone || c.email || c.id || `profile-${idx}`).toString().trim();
        if (key && !deletedCustomerIds.has(c.id)) {
          const isBlocked = blockedCustomerIds.has(c.id) || c.status === 'blocked';
          map.set(key, {
            id: c.id || `cust-p-${idx}`,
            name: c.name || 'Customer',
            phone: c.phone || 'N/A',
            email: c.email || 'N/A',
            address: c.address || 'Botad, Gujarat',
            city: c.city || c.address?.split(',')?.slice(-2)?.[0]?.trim() || 'Botad',
            totalOrders: 0,
            ltv: 0,
            status: isBlocked ? 'blocked' : 'active',
            createdAt: c.createdAt || c.created_at || 'Recently'
          });
        }
      });
    }

    // 2. Combine with actual placed orders
    if (Array.isArray(orders)) {
      orders.forEach((o, oIdx) => {
        const phone = o.customerPhone || o.customer_phone || o.customer?.phone || o.shippingAddress?.phone || '';
        const email = (o.customerEmail || o.customer_email || o.customer?.email || '').toLowerCase().trim();
        const key = phone || email || (o.customerId ? String(o.customerId) : `order-${o.id || oIdx}`);

        if (key) {
          const custId = o.customerId || `cust-ord-${o.id || oIdx}`;
          if (deletedCustomerIds.has(custId)) return;

          if (map.has(key)) {
            const existing = map.get(key);
            existing.totalOrders += 1;
            existing.ltv += (Number(o.totalAmount || o.total) || 0);
          } else {
            const isBlocked = blockedCustomerIds.has(custId);
            map.set(key, {
              id: custId,
              name: o.customerName || o.customer?.name || 'Customer',
              phone: phone || 'N/A',
              email: email || 'N/A',
              address: o.shippingAddress?.address || o.address || 'Botad, Gujarat',
              city: o.shippingAddress?.city || o.city || 'Botad',
              totalOrders: 1,
              ltv: Number(o.totalAmount || o.total) || 0,
              status: isBlocked ? 'blocked' : 'active',
              createdAt: o.createdAt || 'Recently'
            });
          }
        }
      });
    }

    const list = Array.from(map.values());
    const seenIds = new Set();
    const uniqueList = list.map((c, index) => {
      let uniqueId = c.id ? String(c.id) : `cust-${index}`;
      if (seenIds.has(uniqueId)) {
        uniqueId = `${uniqueId}-${index}-${Math.random().toString(36).slice(2, 7)}`;
      }
      seenIds.add(uniqueId);
      return { ...c, id: uniqueId };
    });

    return uniqueList.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      return !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q));
    });
  }, [customers, orders, searchQuery, blockedCustomerIds, deletedCustomerIds]);

  // Handle Block / Unblock Customer
  const handleToggleBlock = (cust) => {
    const isCurrentlyBlocked = cust.status === 'blocked';
    const newStatus = isCurrentlyBlocked ? 'active' : 'blocked';

    setBlockedCustomerIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyBlocked) {
        next.delete(cust.id);
      } else {
        next.add(cust.id);
      }
      return next;
    });

    // Call service to persist
    customerService.toggleCustomerStatus(cust.id);

    // Update customers state if setCustomers provided
    if (setCustomers && typeof setCustomers === 'function') {
      setCustomers(prev => (prev || []).map(c => c.id === cust.id ? { ...c, status: newStatus } : c));
    }

    if (selectedCustomer && selectedCustomer.id === cust.id) {
      setSelectedCustomer(prev => ({ ...prev, status: newStatus }));
    }

    const toastMsg = isCurrentlyBlocked
      ? `Customer "${cust.name}" has been unblocked. They can now sign in.`
      : `Customer "${cust.name}" has been blocked and cannot sign in.`;

    if (showToast) showToast(toastMsg, isCurrentlyBlocked ? 'success' : 'info');
    if (auditLog) {
      auditLog('TOGGLE_CUSTOMER_STATUS', cust.name, `Changed account status to ${newStatus.toUpperCase()}`);
    }
  };

  // Handle Delete Customer Confirmation
  const handleConfirmDeleteCustomer = () => {
    if (!deleteCustomerConfirm.customerId) return;
    const cid = deleteCustomerConfirm.customerId;
    const cname = deleteCustomerConfirm.customerName;

    setDeletedCustomerIds(prev => new Set(prev).add(cid));
    customerService.deleteCustomer(cid);

    if (setCustomers && typeof setCustomers === 'function') {
      setCustomers(prev => (prev || []).filter(c => c.id !== cid));
    }

    if (selectedCustomer && selectedCustomer.id === cid) {
      setSelectedCustomer(null);
    }

    setDeleteCustomerConfirm({ isOpen: false, customerId: null, customerName: '' });

    if (showToast) showToast(`Customer account for "${cname}" deleted permanently.`, 'info');
    if (auditLog) {
      auditLog('DELETE_CUSTOMER_ACCOUNT', cname, `Deleted customer profile from database`);
    }
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.email) return;

    const newMember = {
      id: 'staff-' + Date.now(),
      name: newStaffForm.name,
      email: newStaffForm.email,
      role: newStaffForm.role,
      access: newStaffForm.access,
      status: 'Active'
    };

    setStaffList([...staffList, newMember]);
    setShowAddStaffModal(false);
    setNewStaffForm({ name: '', email: '', role: 'Catalog Manager', access: 'Products, Banners & Categories' });
    showToast(`Staff member "${newMember.name}" assigned as ${newMember.role}`, 'success');
    if (auditLog) {
      auditLog('ADD_STAFF_MEMBER', newMember.name, `Granted ${newMember.role} access (${newMember.access})`);
    }
  };

  const handleConfirmDeleteStaff = () => {
    if (!deleteStaffConfirm.staffId) return;
    const staffMember = staffList.find(s => s.id === deleteStaffConfirm.staffId);
    setStaffList(staffList.filter(s => s.id !== deleteStaffConfirm.staffId));
    setDeleteStaffConfirm({ isOpen: false, staffId: null, staffName: '' });
    showToast(`Staff member access revoked for "${staffMember?.name || 'Staff'}"`, 'info');
    if (auditLog) {
      auditLog('REMOVE_STAFF_MEMBER', staffMember?.name || 'Staff', `Revoked store admin access`);
    }
  };

  // Get customer specific orders
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return (orders || []).filter(o => {
      const p = o.customerPhone || o.customer_phone || o.customer?.phone || '';
      const e = (o.customerEmail || o.customer_email || o.customer?.email || '').toLowerCase().trim();
      return (p && p === selectedCustomer.phone) || (e && e === selectedCustomer.email) || (o.customerId === selectedCustomer.id);
    });
  }, [selectedCustomer, orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Customer Directory & Team Access Roles</span>
          </h2>
          <p className="text-xs text-neutral-500">
            View customer order history, block/unblock users, delete accounts & manage admin permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-neutral-100 p-1 rounded-xl flex space-x-1 text-xs">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'customers' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customers ({enrichedCustomers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'staff' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Team ({staffList.length})</span>
            </button>
          </div>

          {activeTab === 'staff' && (
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'customers' && (
        <>
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers by name, phone number, city, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Phone / WhatsApp</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Total Orders</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4 text-center">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {enrichedCustomers.length > 0 ? (
                    enrichedCustomers.map((cust, idx) => (
                      <tr key={cust.id || `cust-row-${idx}`} className={`hover:bg-neutral-50/70 transition ${cust.status === 'blocked' ? 'bg-rose-50/30' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full font-serif font-black text-xs flex items-center justify-center text-white ${cust.status === 'blocked' ? 'bg-rose-600' : 'bg-neutral-900'}`}>
                              {cust.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-neutral-900">{cust.name}</span>
                                {cust.status === 'blocked' && (
                                  <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">
                                    BLOCKED
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-400 font-mono">{cust.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-medium text-neutral-700">
                          {cust.phone}
                        </td>

                        <td className="p-4 text-neutral-700">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            <span>{cust.city}</span>
                          </span>
                        </td>

                        <td className="p-4 font-mono font-bold text-neutral-900">
                          {cust.totalOrders} {cust.totalOrders === 1 ? 'Order' : 'Orders'}
                        </td>

                        <td className="p-4 font-mono font-black text-neutral-900 text-sm">
                          ₹{cust.ltv.toLocaleString('en-IN')}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            cust.status === 'blocked'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : cust.totalOrders >= 4
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : cust.totalOrders >= 1
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }`}>
                            {cust.status === 'blocked' ? 'Blocked' : cust.totalOrders >= 4 ? 'VIP' : 'Active'}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* View Details */}
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                              title="View Customer Profile & History"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Block / Unblock */}
                            <button
                              onClick={() => handleToggleBlock(cust)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                cust.status === 'blocked'
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                              }`}
                              title={cust.status === 'blocked' ? 'Unblock Customer Account' : 'Block Customer Account'}
                            >
                              {cust.status === 'blocked' ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete Customer */}
                            <button
                              onClick={() => setDeleteCustomerConfirm({ isOpen: true, customerId: cust.id, customerName: cust.name })}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                              title="Delete Customer Profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                        <p className="font-bold text-neutral-700 text-sm">No customers found</p>
                        <p className="text-xs text-neutral-400 mt-1">Customer profiles will appear here as users register or place orders on your store.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Authorized Store Administrators ({staffList.length})
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {staffList.map((st) => (
              <div key={st.id} className="p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">{st.name}</h4>
                    <p className="text-xs text-neutral-500 font-mono">{st.email} • {st.access}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neutral-900 text-white">
                    {st.role}
                  </span>
                  {st.role !== 'Super Admin' && (
                    <button
                      onClick={() => setDeleteStaffConfirm({ isOpen: true, staffId: st.id, staffName: st.name })}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Revoke Admin Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Profile Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-neutral-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl text-white font-serif font-black text-lg flex items-center justify-center ${selectedCustomer.status === 'blocked' ? 'bg-rose-600' : 'bg-neutral-900'}`}>
                  {selectedCustomer.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-neutral-900 flex items-center gap-2">
                    <span>{selectedCustomer.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      selectedCustomer.status === 'blocked'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {selectedCustomer.status === 'blocked' ? 'Account Blocked' : 'Active Customer'}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">ID: {selectedCustomer.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-mono font-bold block">Contact Email</span>
                <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{selectedCustomer.email}</span>
                </span>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-mono font-bold block">Phone / WhatsApp</span>
                <span className="font-bold text-neutral-900 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{selectedCustomer.phone}</span>
                </span>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-mono font-bold block">City & Address</span>
                <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{selectedCustomer.address || selectedCustomer.city}</span>
                </span>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-mono font-bold block">Lifetime Value (LTV)</span>
                <span className="font-black text-rose-700 text-sm flex items-center gap-1 font-mono">
                  <span>₹{selectedCustomer.ltv.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] font-normal text-neutral-500">({selectedCustomer.totalOrders} Orders)</span>
                </span>
              </div>
            </div>

            {/* Customer Order History */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-neutral-700" />
                <span>Order History ({customerOrders.length})</span>
              </h4>

              {customerOrders.length > 0 ? (
                <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100 text-xs">
                  {customerOrders.map(ord => (
                    <div key={ord.id} className="p-3 bg-neutral-50/50 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-neutral-900 block">#{ord.orderNumber || ord.id}</span>
                        <span className="text-[11px] text-neutral-400">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'Recent'} • {ord.items?.length || 1} items
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-neutral-900 block">₹{(ord.totalAmount || ord.total || 0).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-bold uppercase text-amber-700">{ord.status || 'Processing'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 bg-neutral-50 p-4 rounded-xl text-center">
                  No orders placed by this customer yet.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {/* Block/Unblock */}
                <button
                  type="button"
                  onClick={() => handleToggleBlock(selectedCustomer)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer w-full sm:w-auto justify-center ${
                    selectedCustomer.status === 'blocked'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {selectedCustomer.status === 'blocked' ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                  <span>{selectedCustomer.status === 'blocked' ? 'Unblock Customer' : 'Block Customer'}</span>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setDeleteCustomerConfirm({ isOpen: true, customerId: selectedCustomer.id, customerName: selectedCustomer.name })}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 rounded-xl border border-neutral-300 font-bold text-xs hover:bg-neutral-50 transition cursor-pointer w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-200">
            <h3 className="font-serif font-black text-base text-neutral-900">Add Team Administrator</h3>
            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={newStaffForm.name || ''}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@rajlaxmistore.com"
                  value={newStaffForm.email || ''}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Role Permission</label>
                <select
                  value={newStaffForm.role || 'Catalog Manager'}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                >
                  <option value="Catalog Manager">Catalog Manager (Products & Banners)</option>
                  <option value="Fulfillment Officer">Fulfillment Officer (Orders & Logistics)</option>
                  <option value="Support Agent">Support Agent (Customer Queries)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold cursor-pointer"
                >
                  Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Customer Modal */}
      <ConfirmModal
        isOpen={deleteCustomerConfirm.isOpen}
        onClose={() => setDeleteCustomerConfirm({ isOpen: false, customerId: null, customerName: '' })}
        onConfirm={handleConfirmDeleteCustomer}
        title="Delete Customer Account Permanently?"
        message={`Are you sure you want to delete the customer account for "${deleteCustomerConfirm.customerName}"? This action will erase their account profile and cannot be undone.`}
        confirmText="Yes, Delete Customer Account"
        confirmVariant="danger"
      />

      {/* Revoke Staff Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteStaffConfirm.isOpen}
        onClose={() => setDeleteStaffConfirm({ isOpen: false, staffId: null, staffName: '' })}
        onConfirm={handleConfirmDeleteStaff}
        title="Revoke Admin Access?"
        message={`Are you sure you want to revoke administrative permissions for "${deleteStaffConfirm.staffName}"? They will no longer be able to manage store operations.`}
        confirmText="Yes, Revoke Access"
        confirmVariant="danger"
      />
    </div>
  );
}
