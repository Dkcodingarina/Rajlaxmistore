import dataProvider from '../providers/dataProvider';

export const reviewService = {
  getReviews: (productId = null, approvedOnly = true) => {
    return dataProvider.getReviews(productId, approvedOnly);
  },

  getAllReviews: () => {
    return dataProvider.getReviews(null, false);
  },

  addReview: (reviewData) => {
    return dataProvider.addReview(reviewData);
  },

  updateReviewStatus: (id, status) => {
    return dataProvider.updateReviewStatus(id, status);
  },

  addAdminReply: (id, replyText) => {
    // If provider supports it or update review with reply
    const reviews = dataProvider.getReviews(null, false);
    const rev = reviews.find(r => r.id === id);
    if (rev) {
      rev.adminReply = replyText;
      return dataProvider.updateReviewStatus(id, rev.status || 'approved');
    }
    return null;
  },

  deleteReview: (id) => {
    return dataProvider.deleteReview(id);
  }
};

export default reviewService;
