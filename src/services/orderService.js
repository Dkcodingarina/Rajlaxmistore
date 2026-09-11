import dataProvider from '../providers/dataProvider';
import settingsService from './settingsService';

export const orderService = {
  getOrders: () => {
    return dataProvider.getOrders();
  },

  getAllOrders: () => {
    return dataProvider.getAllOrders();
  },

  getOrdersByCustomer: (userOrQuery) => {
    return dataProvider.getOrdersByCustomer(userOrQuery);
  },

  getOrderById: (id) => {
    return dataProvider.getOrderById(id);
  },

  generateOrderNumber: () => {
    const orders = dataProvider.getOrders() || [];
    const nextSeq = (orders.length + 101).toString().padStart(5, '0');
    return `RLX-2026-${nextSeq}`;
  },

  createOrder: (data) => {
    return dataProvider.createOrder(data);
  },

  updateOrderStatus: (id, newStatus, adminNote = '') => {
    return dataProvider.updateOrderStatus(id, newStatus, adminNote);
  },

  buildWhatsAppLink: (order, customWaNumber) => {
    const settings = settingsService.getSettings();
    const waPhone = (customWaNumber || settings.whatsappNumber || '919876543210').replace(/\D/g, '');

    const itemsText = (order.items || []).map((item, i) =>
      `${i + 1}. *${item.name}*\n   Qty: ${item.quantity} x ₹${item.price} = ₹${item.quantity * item.price}`
    ).join('\n\n');

    const customerName = order.customerName || order.customer?.name || 'Customer';
    const customerPhone = order.customerPhone || order.customer?.phone || 'N/A';
    const address = order.address || order.customer?.address || 'N/A';

    const message =
`🛍️ *NEW ORDER - ${(settings.storeName || 'Rajlaxmi Store').toUpperCase()}*
----------------------------------------
📌 *Order No:* ${order.orderNumber || order.id}
👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
📍 *Address:* ${address}

📦 *ORDERED ITEMS:*
${itemsText}

----------------------------------------
💵 *Subtotal:* ₹${order.subtotal}
🏷️ *Discount:* ₹${order.discount}
🚚 *Delivery Fee:* ${(order.deliveryCharge || order.deliveryFee) === 0 ? 'FREE' : `₹${order.deliveryCharge || order.deliveryFee}`}
💰 *GRAND TOTAL:* *₹${order.total || order.totalAmount}*
${order.couponCode ? `🎟️ *Coupon Applied:* ${order.couponCode}\n` : ''}
${order.notes ? `📝 *Notes:* ${order.notes}\n` : ''}
----------------------------------------
Please confirm my order details and share delivery updates. Thank you!`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${waPhone}?text=${encoded}`;
  },

  generateWhatsAppLink: (order, customWaNumber) => {
    return orderService.buildWhatsAppLink(order, customWaNumber);
  }
};

export default orderService;
