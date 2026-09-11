import dataProvider from '../providers/dataProvider';
import notificationService from './notificationService';

export const supportService = {
  getTickets: () => {
    return dataProvider.getSupportTickets ? dataProvider.getSupportTickets() : [];
  },

  getTicketsByCustomer: (emailOrPhone) => {
    const list = dataProvider.getSupportTickets ? dataProvider.getSupportTickets() : [];
    if (!emailOrPhone) return list;
    const cleanStr = emailOrPhone.toString().toLowerCase().trim();
    const cleanPhone = cleanStr.replace(/\D/g, '');

    return list.filter(t => {
      const tEmail = (t.customerEmail || t.customer_email || '').toLowerCase();
      const tPhone = (t.customerPhone || t.customer_phone || '').replace(/\D/g, '');
      return tEmail === cleanStr || (cleanPhone && tPhone.includes(cleanPhone));
    }).sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
  },

  createTicket: ({ customerName, customerEmail, customerPhone, category, orderNumber, message }) => {
    const newTicket = dataProvider.createSupportTicket ? dataProvider.createSupportTicket({
      customerName,
      customerEmail,
      customerPhone,
      category,
      orderNumber,
      message
    }) : null;

    // Trigger Admin Notification for Support Query!
    notificationService.addNotification({
      type: 'support',
      title: '💬 New Support Message Received',
      message: `${customerName || 'A customer'} sent a query regarding "${category}": "${(message || '').slice(0, 60)}${(message || '').length > 60 ? '...' : ''}"`,
      linkTab: 'support',
      data: { ticketId: newTicket?.id, ticketNumber: newTicket?.ticketNumber }
    });

    return newTicket;
  },

  replyToTicket: (ticketId, replyText, adminName = 'Store Support Admin', newStatus = 'replied') => {
    if (dataProvider.replySupportTicket) {
      return dataProvider.replySupportTicket(ticketId, replyText, adminName, newStatus, 'admin');
    }
    return null;
  },

  addAdminReply: function(ticketId, replyText, adminName = 'Store Support Admin', newStatus = 'replied') {
    return this.replyToTicket(ticketId, replyText, adminName, newStatus);
  },

  addCustomerFollowup: (ticketId, messageText) => {
    let updatedTicket = null;
    if (dataProvider.replySupportTicket) {
      updatedTicket = dataProvider.replySupportTicket(ticketId, messageText, 'Customer', 'pending', 'customer');
    }

    notificationService.addNotification({
      type: 'support',
      title: `💬 Support Follow-up on #${updatedTicket?.ticketNumber || ticketId}`,
      message: `Customer: "${(messageText || '').slice(0, 60)}${(messageText || '').length > 60 ? '...' : ''}"`,
      linkTab: 'support',
      data: { ticketId, ticketNumber: updatedTicket?.ticketNumber }
    });

    return updatedTicket;
  },

  updateTicketStatus: (ticketId, status) => {
    if (dataProvider.updateSupportTicketStatus) {
      return dataProvider.updateSupportTicketStatus(ticketId, status);
    }
    return null;
  },

  deleteTicket: (ticketId) => {
    if (dataProvider.deleteSupportTicket) {
      return dataProvider.deleteSupportTicket(ticketId);
    }
    return true;
  },

  addResponse: function(ticketId, replyText, adminName = 'Store Support Admin', newStatus = 'resolved') {
    return this.replyToTicket(ticketId, replyText, adminName, newStatus);
  }
};

export default supportService;

