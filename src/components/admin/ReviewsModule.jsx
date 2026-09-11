import React, { useState, useMemo } from 'react';
import {
  Star,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  Sparkles,
  User,
  Package,
  Calendar,
  Send
} from 'lucide-react';
import reviewService from '../../services/reviewService';
import ConfirmModal from '../common/ConfirmModal';

export default function ReviewsModule({
  reviews = [],
  setReviews,
  products = [],
  showToast,
  auditLog
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [ratingFilter, setRatingFilter] = useState('all');
  const [replyingToId, setReplyingToId] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, reviewId: null, customerName: '' });

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.productName && r.productName.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);

      return matchSearch && matchStatus && matchRating;
    });
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  const handleUpdateStatus = (id, newStatus, customerName) => {
    reviewService.updateReviewStatus(id, newStatus);
    setReviews(reviewService.getAllReviews());
    showToast(`Review by ${customerName} marked as ${newStatus.toUpperCase()}`, 'info');
    if (auditLog) {
      auditLog('MODERATE_REVIEW', `Review #${id}`, `Updated review approval status to ${newStatus}`);
    }
  };

  const handleDelete = (id, customerName) => {
    setDeleteConfirm({ isOpen: true, reviewId: id, customerName });
  };

  const confirmDeleteReviewAction = () => {
    const { reviewId, customerName } = deleteConfirm;
    if (!reviewId) return;
    reviewService.deleteReview(reviewId);
    setReviews(reviewService.getAllReviews());
    showToast(`Review by ${customerName} removed`, 'info');
    if (auditLog) {
      auditLog('DELETE_REVIEW', `Review #${reviewId}`, `Removed customer review by ${customerName}`);
    }
    setDeleteConfirm({ isOpen: false, reviewId: null, customerName: '' });
  };

  const handleSendReply = (reviewId, customerName) => {
    if (!adminReplyText.trim()) return;
    reviewService.addAdminReply(reviewId, adminReplyText);
    setReviews(reviewService.getAllReviews());
    setReplyingToId(null);
    setAdminReplyText('');
    showToast(`Official store response posted to ${customerName}'s review`, 'success');
    if (auditLog) {
      auditLog('REPLY_REVIEW', `Review #${reviewId}`, `Admin replied: "${adminReplyText.slice(0, 30)}..."`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Customer Testimonials & Reviews Moderation</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Audit customer ratings, verify genuine customer feedback, publish verified reviews, and reply officially
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
            {reviews.filter(r => r.status === 'pending').length} Pending Approval
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {reviews.filter(r => r.status === 'approved').length} Published
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviewer name, feedback comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
            >
              <option value="all">All Moderation Status</option>
              <option value="pending">Pending Moderation</option>
              <option value="approved">Approved & Published</option>
              <option value="rejected">Rejected / Hidden</option>
            </select>
          </div>

          <div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="1">⭐ 1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-neutral-400 border border-neutral-200/80 shadow-xs">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
            <p className="font-bold text-neutral-700 text-sm">No reviews found matching criteria</p>
            <p className="text-xs">Customer feedback submissions will appear here for review</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 text-white font-serif font-black flex items-center justify-center text-xs">
                    {rev.customerName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-neutral-900">{rev.customerName}</span>
                      {rev.verified && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          ✓ Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Reviewed on: {rev.date || 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Rating Stars & Status */}
                <div className="flex items-center space-x-3 self-start sm:self-auto">
                  <div className="flex items-center space-x-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
                      />
                    ))}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                    rev.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : rev.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {rev.status || 'pending'}
                  </span>
                </div>
              </div>

              {/* Review Content & Product Title */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-neutral-500 font-medium">
                  <Package className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Item: <strong className="text-neutral-800">{rev.productName || 'Catalog Product'}</strong></span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-normal">
                  "{rev.comment || rev.text}"
                </p>
              </div>

              {/* Admin Official Response if exists */}
              {rev.adminReply && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs space-y-1">
                  <span className="font-bold text-neutral-800 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Official Store Response:</span>
                  </span>
                  <p className="text-neutral-600 italic">"{rev.adminReply}"</p>
                </div>
              )}

              {/* Inline Reply Input Box */}
              {replyingToId === rev.id && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-300 space-y-2">
                  <textarea
                    rows="2"
                    placeholder={`Write an official store reply to ${rev.customerName}...`}
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setReplyingToId(null)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendReply(rev.id, rev.customerName)}
                      className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post Reply</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-xs">
                <button
                  onClick={() => setReplyingToId(rev.id)}
                  className="text-neutral-600 hover:text-neutral-900 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{rev.adminReply ? 'Edit Response' : 'Reply Officially'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, 'approved', rev.customerName)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                  {rev.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, 'rejected', rev.customerName)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(rev.id, rev.customerName)}
                    className="p-1.5 rounded-xl bg-neutral-100 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Safe Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Customer Review?"
        message={`Are you sure you want to permanently delete the review submitted by "${deleteConfirm.customerName}"?`}
        confirmText="Yes, Delete Review"
        cancelText="Keep Review"
        confirmVariant="danger"
        onConfirm={confirmDeleteReviewAction}
        onClose={() => setDeleteConfirm({ isOpen: false, reviewId: null, customerName: '' })}
      />
    </div>
  );
}
