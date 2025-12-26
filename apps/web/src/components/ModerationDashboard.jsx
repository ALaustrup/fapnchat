/**
 * WYA!? — Moderation Dashboard (Alpha)
 * 
 * Purpose: Human review interface for moderation
 * 
 * Features:
 * - Report queue
 * - Contextual review
 * - Moderation actions (warn, mute, restrict, escalate)
 * - Audit logging visible
 * - No shadow actions
 */

import { useState, useEffect } from "react";
import {
  Flag,
  AlertTriangle,
  Shield,
  Ban,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  User,
  Calendar,
} from "lucide-react";
import GlassPanel from "./ui/GlassPanel";
import GlowButton from "./ui/GlowButton";
import ModalOverlay from "./ui/ModalOverlay";
import FloatingCard from "./ui/FloatingCard";

const REPORT_TYPES = {
  harassment: { label: "Harassment", color: "text-red-400", icon: AlertTriangle },
  spam: { label: "Spam", color: "text-yellow-400", icon: MessageSquare },
  inappropriate: { label: "Inappropriate", color: "text-orange-400", icon: Flag },
  abuse: { label: "Abuse", color: "text-red-500", icon: Ban },
  scam: { label: "Scam", color: "text-purple-400", icon: Shield },
  other: { label: "Other", color: "text-gray-400", icon: Flag },
};

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-400",
  reviewing: "bg-blue-500/20 text-blue-400",
  resolved: "bg-green-500/20 text-green-400",
  dismissed: "bg-gray-500/20 text-gray-400",
};

const ACTION_TYPES = {
  warn: { label: "Warn", color: "text-yellow-400", icon: AlertTriangle },
  mute: { label: "Mute", color: "text-orange-400", icon: MessageSquare },
  restrict: { label: "Restrict", color: "text-red-400", icon: Shield },
  escalate: { label: "Escalate", color: "text-purple-400", icon: Ban },
};

export default function ModerationDashboard() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      const url = statusFilter
        ? `/api/reports?status=${statusFilter}`
        : "/api/reports";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load reports");
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, status, notes) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, review_notes: notes }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await loadReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAction = async (actionData) => {
    try {
      const res = await fetch("/api/moderation/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_user_id: selectedReport.reported_user_id,
          action_type: actionData.type,
          reason: actionData.reason,
          duration_minutes: actionData.duration_minutes,
          report_id: selectedReport.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create action");
      }
      await handleStatusUpdate(selectedReport.id, "resolved", actionData.reason);
      setShowActionModal(false);
      setSelectedReport(null);
      await loadReports();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0F0F0F] p-6 overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Moderation Dashboard</h1>
        <p className="text-[#8B8B90] text-sm">
          Review reports and take moderation actions. All actions are logged and visible.
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Reports List */}
        <div className="w-96 flex flex-col">
          <GlassPanel className="p-4 mb-4">
            <div className="flex gap-2 mb-4">
              {["pending", "reviewing", "resolved", "dismissed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-[#7A5AF8] text-white"
                      : "bg-[#27272A] text-[#8B8B90] hover:text-white"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="text-sm text-[#8B8B90]">
              {reports.length} {statusFilter} report{reports.length !== 1 ? "s" : ""}
            </div>
          </GlassPanel>

          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-[#8B8B90] text-center py-8">Loading...</p>
            ) : reports.length === 0 ? (
              <p className="text-[#8B8B90] text-center py-8">No reports found</p>
            ) : (
              reports.map((report) => {
                const typeConfig = REPORT_TYPES[report.report_type] || REPORT_TYPES.other;
                const Icon = typeConfig.icon;
                return (
                  <FloatingCard
                    key={report.id}
                    elevation="sm"
                    className={`p-4 cursor-pointer transition-all ${
                      selectedReport?.id === report.id
                        ? "border-[#7A5AF8] border-2"
                        : ""
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.color.replace("text-", "bg-").replace("-400", "-400/20")}`}
                      >
                        <Icon size={20} className={typeConfig.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">
                            {typeConfig.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[report.status]}`}
                          >
                            {report.status}
                          </span>
                        </div>
                        <p className="text-[#8B8B90] text-xs truncate">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[#8B8B90]">
                          <Calendar size={12} />
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </FloatingCard>
                );
              })
            )}
          </div>
        </div>

        {/* Report Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedReport ? (
            <ReportDetailView
              report={selectedReport}
              onStatusUpdate={handleStatusUpdate}
              onAction={() => setShowActionModal(true)}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Eye size={48} className="mx-auto mb-4 text-[#8B8B90]" />
                <p className="text-[#8B8B90]">Select a report to review</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <ActionModal
          report={selectedReport}
          onClose={() => setShowActionModal(false)}
          onSubmit={handleAction}
        />
      )}
    </div>
  );
}

function ReportDetailView({ report, onStatusUpdate, onAction }) {
  const [notes, setNotes] = useState("");
  const typeConfig = REPORT_TYPES[report.report_type] || REPORT_TYPES.other;
  const Icon = typeConfig.icon;

  const context = report.context_snapshot || {};

  return (
    <GlassPanel className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${typeConfig.color.replace("text-", "bg-").replace("-400", "-400/20")}`}
          >
            <Icon size={24} className={typeConfig.color} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{typeConfig.label}</h2>
            <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[report.status]}`}>
              {report.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <GlowButton glow="purple" size="sm" onClick={onAction}>
            Take Action
          </GlowButton>
        </div>
      </div>

      {/* Report Info */}
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-[#8B8B90] mb-2">Description</h3>
          <p className="text-white">{report.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[#8B8B90] mb-2">Reporter</h3>
            <p className="text-white">
              {report.reporter_display_name || report.reporter_id}
            </p>
          </div>
          {report.reported_user_id && (
            <div>
              <h3 className="text-sm font-semibold text-[#8B8B90] mb-2">Reported User</h3>
              <p className="text-white">
                {report.reported_display_name || report.reported_user_id}
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#8B8B90] mb-2">Reported At</h3>
          <p className="text-white">
            {new Date(report.created_at).toLocaleString()}
          </p>
        </div>

        {/* Context Snapshot */}
        {context.message && (
          <div>
            <h3 className="text-sm font-semibold text-[#8B8B90] mb-2">Message Context</h3>
            <GlassPanel className="p-4">
              <p className="text-white">{context.message.message_text}</p>
              <p className="text-[#8B8B90] text-xs mt-2">
                Sent: {new Date(context.message.created_at).toLocaleString()}
              </p>
            </GlassPanel>
          </div>
        )}

        {report.review_notes && (
          <div>
            <h3 className="text-sm font-semibold text-[#8B8B90] mb-2">Review Notes</h3>
            <p className="text-white">{report.review_notes}</p>
            {report.moderator_display_name && (
              <p className="text-[#8B8B90] text-xs mt-1">
                Reviewed by: {report.moderator_display_name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {report.status === "pending" && (
        <div className="border-t border-[#27272A] pt-4">
          <h3 className="text-sm font-semibold text-[#8B8B90] mb-3">Quick Actions</h3>
          <div className="flex gap-2">
            <GlowButton
              glow="green"
              size="sm"
              onClick={() => onStatusUpdate(report.id, "dismissed", "Dismissed without action")}
            >
              Dismiss
            </GlowButton>
            <GlowButton
              glow="cyan"
              size="sm"
              onClick={() => onStatusUpdate(report.id, "reviewing", notes)}
            >
              Mark Reviewing
            </GlowButton>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}

function ActionModal({ report, onClose, onSubmit }) {
  const [actionType, setActionType] = useState("warn");
  const [reason, setReason] = useState("");
  const [durationHours, setDurationHours] = useState(24);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Reason is required");
      return;
    }

    const durationMinutes = durationHours * 60;
    
    // Permanent actions require escalation
    if (durationHours === 0 && actionType !== "escalate") {
      alert("Permanent actions require escalation type");
      return;
    }

    setSubmitting(true);
    onSubmit({
      type: actionType,
      reason: reason.trim(),
      duration_minutes: durationHours > 0 ? durationMinutes : null,
    });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <GlassPanel className="p-6 max-w-lg">
        <h2 className="text-xl font-bold text-white mb-4">Take Moderation Action</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#8B8B90] mb-2 block">
              Action Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ACTION_TYPES).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setActionType(type)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      actionType === type
                        ? "border-[#7A5AF8] bg-[#7A5AF8]/20"
                        : "border-[#27272A] bg-[#1A1A1E] hover:border-[#3A3A3D]"
                    }`}
                  >
                    <Icon size={20} className={config.color} />
                    <p className="text-white text-sm mt-1">{config.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {actionType !== "warn" && (
            <div>
              <label className="text-sm font-semibold text-[#8B8B90] mb-2 block">
                Duration (hours, 0 = permanent)
              </label>
              <input
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              />
              {durationHours === 0 && actionType !== "escalate" && (
                <p className="text-yellow-400 text-xs mt-1">
                  Permanent actions require escalation type
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-[#8B8B90] mb-2 block">
              Reason (visible to user)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this action is being taken..."
              rows={4}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] resize-none"
            />
            <p className="text-[#8B8B90] text-xs mt-1">
              This reason will be visible to the user. No shadow actions.
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-[#27272A]">
            <GlowButton
              glow="purple"
              onClick={handleSubmit}
              disabled={!reason.trim() || submitting}
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Submit Action"}
            </GlowButton>
            <GlowButton glow="cyan" variant="ghost" onClick={onClose}>
              Cancel
            </GlowButton>
          </div>
        </div>
      </GlassPanel>
    </ModalOverlay>
  );
}

