import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  Printer,
  Calendar,
  IndianRupee,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Check,
  AlertTriangle,
  X,
  ExternalLink
} from 'lucide-react';
import orderService from '../../services/orderService';
import ConfirmModal from '../common/ConfirmModal';

export default function OrdersModule({
  orders = [],
  setOrders,
  showToast,
  auditLog,
  storeSettings
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [fulfillForm, setFulfillForm] = useState({
    courier: 'BlueDart Express',
    trackingNumber: '',
    notes: 'Dispatched in premium protective packaging'
  });
  const [statusConfirm, setStatusConfirm] = useState({
    isOpen: false,
    orderId: null,
    newStatus: ''
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase();
      const cName = o.customerName || o.customer?.name || '';
      const cPhone = o.customerPhone || o.customer?.phone || o.shippingAddress?.phone || '';
      const cEmail = o.customerEmail || o.customer?.email || '';

      const matchSearch = !q ||
        (o.id && String(o.id).toLowerCase().includes(q)) ||
        (cName && cName.toLowerCase().includes(q)) ||
        (cPhone && cPhone.toLowerCase().includes(q)) ||
        (cEmail && cEmail.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = (orderId, newStatus) => {
    setStatusConfirm({
      isOpen: true,
      orderId,
      newStatus
    });
  };

  const executeStatusChange = () => {
    const { orderId, newStatus } = statusConfirm;
    if (!orderId || !newStatus) return;

    orderService.updateOrderStatus(orderId, newStatus);
    const updated = orderService.getAllOrders();
    setOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updated.find(o => o.id === orderId));
    }
    showToast(`Order #${orderId} status updated to ${newStatus.toUpperCase()}`, 'success');
    if (auditLog) {
      auditLog('UPDATE_ORDER_STATUS', `Order #${orderId}`, `Transitioned status to ${newStatus}`);
    }
    setStatusConfirm({ isOpen: false, orderId: null, newStatus: '' });
  };

  const handleOpenFulfillModal = (ord) => {
    setSelectedOrder(ord);
    setFulfillForm({
      courier: ord.logistics?.courier || 'BlueDart Express',
      trackingNumber: ord.logistics?.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: ord.logistics?.notes || 'Dispatched in signature protective luxury packaging'
    });
    setShowFulfillModal(true);
  };

  const handleSaveFulfillment = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const logisticsPayload = {
      courier: fulfillForm.courier,
      trackingNumber: fulfillForm.trackingNumber,
      notes: fulfillForm.notes,
      dispatchedAt: new Date().toISOString()
    };

    orderService.updateOrderStatus(selectedOrder.id, 'dispatched', logisticsPayload);
    const updated = orderService.getAllOrders();
    setOrders(updated);
    setSelectedOrder(updated.find(o => o.id === selectedOrder.id));
    setShowFulfillModal(false);
    showToast(`Order #${selectedOrder.id} marked as DISPATCHED via ${fulfillForm.courier}`, 'success');
    if (auditLog) {
      auditLog('DISPATCH_ORDER', `Order #${selectedOrder.id}`, `Assigned courier ${fulfillForm.courier} (Tracking #${fulfillForm.trackingNumber})`);
    }
  };

  const handlePrintInvoice = (ord) => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow popups to print invoice.');
      return;
    }

    const itemsHtml = (ord.items || []).map((item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${idx + 1}. ${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">₹${(item.quantity || 1) * item.price}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${ord.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #111; font-size: 13px; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .meta-grid { display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            .totals-box { float: right; width: 300px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .grand-total { font-weight: bold; font-size: 16px; border-top: 2px solid #cbd5e1; padding-top: 8px; color: #e11d48; }
            .footer { clear: both; text-align: center; margin-top: 50px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${storeSettings?.storeName || 'Rajlaxmi Store'}</h1>
            <p>${storeSettings?.tagline || 'Cosmetics, Stationery & Festive Hampers'}</p>
            <p>${storeSettings?.address || 'Station Road, Near Tower Chowk, Botad, Gujarat - 364710'} • Phone: ${storeSettings?.phone || '+91 98765 43210'}</p>
          </div>

          <div class="meta-grid">
            <div>
              <strong>ORDER INVOICE:</strong> #${ord.id}<br>
              <strong>Date:</strong> ${ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'N/A'}<br>
              <strong>Payment Status:</strong> ${ord.paymentStatus || 'Paid / COD'}<br>
              <strong>Method:</strong> ${ord.paymentMethod || 'COD'}
            </div>
            <div>
              <strong>CUSTOMER / SHIP TO:</strong><br>
              <strong>${ord.customerName || ord.customer?.name || 'Customer'}</strong><br>
              Phone: ${ord.customerPhone || ord.customer?.phone || ord.shippingAddress?.phone || 'N/A'}<br>
              ${ord.shippingAddress?.address || 'Street Address'}, ${ord.shippingAddress?.city || 'Botad'} - ${ord.shippingAddress?.pincode || '364710'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-box">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${ord.subtotal || ord.total}</span>
            </div>
            ${ord.discount ? `
              <div class="total-row" style="color: #16a34a;">
                <span>Discount Promo:</span>
                <span>-₹${ord.discount}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>Shipping Fee:</span>
              <span>${ord.deliveryCharge ? `₹${ord.deliveryCharge}` : 'FREE Delivery'}</span>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total:</span>
              <span>₹${ord.total}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping at ${storeSettings?.storeName || 'Rajlaxmi Store'}! For inquiries, WhatsApp ${storeSettings?.whatsappNumber || '+91 98765 43210'}.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const statusList = [
    { id: 'all', label: 'All Orders' },
    { id: 'placed', label: 'Placed' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'packing', label: 'Packing' },
    { id: 'dispatched', label: 'Dispatched' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <span>Order Fulfillment & Logistics Desk</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Track order lifecycle from placement, warehouse packing to courier tracking and receipt printing
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
            {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} In-Fulfillment
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {orders.filter(o => o.status === 'delivered').length} Delivered
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
              placeholder="Search by Order ID (#ORD-...), customer name, mobile phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100 text-xs">
          {statusList.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                statusFilter === s.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {s.label}
            </button>
          ))}
          <span className="text-[11px] font-mono text-neutral-400 ml-auto">
            {filteredOrders.length} Orders Listed
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer & Phone</th>
                <th className="p-4">Items / Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-neutral-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                    <p className="font-bold text-neutral-700">No orders found</p>
                    <p className="text-[11px]">Orders placed by customers will appear here in real time</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const statusColors = {
                    placed: 'bg-amber-50 text-amber-800 border-amber-200',
                    confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
                    packing: 'bg-purple-50 text-purple-800 border-purple-200',
                    dispatched: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    cancelled: 'bg-rose-50 text-rose-800 border-rose-200'
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-neutral-50/70 transition">
                      <td className="p-4">
                        <span className="font-mono font-bold text-xs text-neutral-900 block">#{ord.id}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'Today'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-neutral-900">{ord.customerName || ord.customer?.name || 'Customer'}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{ord.customerPhone || ord.customer?.phone || ord.shippingAddress?.phone || 'No phone'}</div>
                      </td>

                      <td className="p-4 font-mono">
                        <div className="font-black text-neutral-900 text-sm">₹{ord.total}</div>
                        <div className="text-[11px] text-neutral-500">{ord.items?.length || 1} items</div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium text-[11px] block w-max">
                          {ord.paymentMethod || 'COD'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border uppercase font-mono cursor-pointer ${statusColors[ord.status] || 'bg-neutral-100'}`}
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="packing">Packing</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        {ord.logistics?.courier && (
                          <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
                            🚚 {ord.logistics.courier} ({ord.logistics.trackingNumber})
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {ord.status !== 'dispatched' && ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                            <button
                              onClick={() => handleOpenFulfillModal(ord)}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition flex items-center space-x-1 cursor-pointer"
                              title="Assign Courier & Dispatch"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Dispatch</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                            title="View Full Order Summary"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePrintInvoice(ord)}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                            title="Print Invoice Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && !showFulfillModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                  Order Lifecycle Ledger
                </span>
                <h3 className="font-serif font-black text-xl text-neutral-900">
                  Order #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Customer & Shipping Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1.5">
                  <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-600" />
                    <span>Customer Contact</span>
                  </span>
                  <p className="font-black text-sm text-neutral-900">{selectedOrder.customerName || selectedOrder.customer?.name || 'Customer'}</p>
                  <p className="text-neutral-600 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-neutral-400" />
                    <span>{selectedOrder.customerPhone || selectedOrder.customer?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</span>
                  </p>
                  <p className="text-neutral-600 flex items-center gap-1 font-mono">
                    <Mail className="w-3 h-3 text-neutral-400" />
                    <span>{selectedOrder.customerEmail || selectedOrder.customer?.email || 'N/A'}</span>
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1.5">
                  <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Shipping Address</span>
                  </span>
                  <p className="text-neutral-800 leading-relaxed">
                    {selectedOrder.shippingAddress?.address || 'Street address'},<br />
                    {selectedOrder.shippingAddress?.city || 'Botad'}, {selectedOrder.shippingAddress?.state || 'Gujarat'} - {selectedOrder.shippingAddress?.pincode || '364710'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                <div className="p-3 bg-neutral-50 font-bold text-neutral-700 border-b border-neutral-200">
                  Itemized Line Items ({selectedOrder.items?.length || 0})
                </div>
                <div className="divide-y divide-neutral-100 p-2">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80'}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                        />
                        <div>
                          <p className="font-bold text-neutral-900">{item.name}</p>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            Qty: {item.quantity || 1} × ₹{item.price}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-900">
                        ₹{(item.quantity || 1) * item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Financial Summary */}
              <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-2 font-mono">
                <div className="flex justify-between text-neutral-300">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal || selectedOrder.total}</span>
                </div>
                {selectedOrder.discount && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Savings:</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-300">
                  <span>Delivery Charge:</span>
                  <span>{selectedOrder.deliveryCharge ? `₹${selectedOrder.deliveryCharge}` : 'FREE'}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-neutral-800">
                  <span>Grand Total:</span>
                  <span className="text-rose-400">₹{selectedOrder.total}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition cursor-pointer"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch & Fulfillment Modal */}
      {showFulfillModal && selectedOrder && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
              <div>
                <h3 className="font-serif font-black text-lg text-neutral-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <span>Dispatch Order #{selectedOrder.id}</span>
                </h3>
                <p className="text-[11px] text-neutral-500">Assign courier partner & tracking consignment number</p>
              </div>
              <button
                onClick={() => setShowFulfillModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFulfillment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Logistics Courier Partner *</label>
                <select
                  value={fulfillForm.courier}
                  onChange={(e) => setFulfillForm({ ...fulfillForm, courier: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                >
                  <option value="BlueDart Express">BlueDart Express Air</option>
                  <option value="Delhivery Surface & Express">Delhivery Express</option>
                  <option value="DHL Express Luxury">DHL Express India</option>
                  <option value="DTDC Premium">DTDC Courier</option>
                  <option value="Direct Store Hand Delivery">Direct Store Delivery (Botad Local)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Consignment / Tracking ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BD-8829104"
                  value={fulfillForm.trackingNumber}
                  onChange={(e) => setFulfillForm({ ...fulfillForm, trackingNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Packaging / Fulfillment Notes</label>
                <textarea
                  rows="2"
                  value={fulfillForm.notes}
                  onChange={(e) => setFulfillForm({ ...fulfillForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowFulfillModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-sm cursor-pointer flex items-center space-x-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Confirm Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Transition Confirmation Modal */}
      <ConfirmModal
        isOpen={statusConfirm.isOpen}
        onClose={() => setStatusConfirm({ isOpen: false, orderId: null, newStatus: '' })}
        onConfirm={executeStatusChange}
        title="Update Order Status?"
        message={`Are you sure you want to update the status of Order #${statusConfirm.orderId} to "${statusConfirm.newStatus?.toUpperCase()}"?`}
        confirmText={`Yes, Set to ${statusConfirm.newStatus?.toUpperCase() || 'Update'}`}
        confirmVariant={statusConfirm.newStatus === 'cancelled' ? 'danger' : 'primary'}
      />
    </div>
  );
}
