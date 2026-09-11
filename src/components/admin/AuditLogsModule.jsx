import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  ShieldAlert,
  Clock,
  User,
  Filter,
  CheckCircle,
  FileText
} from 'lucide-react';
import auditService from '../../services/auditService';
import ConfirmModal from '../common/ConfirmModal';

export default function AuditLogsModule({
  logs = [],
  setLogs,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredLogs = (logs || []).filter(l => {
    const q = searchQuery.toLowerCase();
    return !q ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.target && l.target.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      (l.user && l.user.toLowerCase().includes(q));
  });

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const confirmClearLogsAction = () => {
    auditService.clearLogs();
    setLogs([]);
    showToast('Audit trail history wiped', 'info');
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-800" />
            <span>Storefront Audit Trail & Governance Logs</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Immutable trace of admin stock updates, price markdowns, order fulfillment milestones, and campaign drops
          </p>
        </div>

        <button
          onClick={handleClear}
          className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-600 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by action type, target SKU, order ID or admin note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin Operator</th>
                <th className="p-4">Action Type</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Details & Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-neutral-400">
                    <History className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                    <p className="font-bold text-neutral-700">No audit records found</p>
                    <p className="text-[11px]">All administrative changes will be logged here in real time</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/70 transition">
                    <td className="p-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Recent'}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{log.user || 'Store Administrator'}</span>
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase bg-neutral-100 text-neutral-800 border border-neutral-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-neutral-900">
                      {log.target}
                    </td>

                    <td className="p-4 text-neutral-600">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safe Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Wipe Administrative Audit Logs?"
        message="Are you sure you want to permanently clear the store governance audit trail? All logged actions and timestamps will be purged."
        confirmText="Yes, Wipe Audit Trail"
        cancelText="Keep Logs"
        confirmVariant="danger"
        onConfirm={confirmClearLogsAction}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
