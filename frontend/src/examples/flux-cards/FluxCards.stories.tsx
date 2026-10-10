import type { Meta, StoryObj } from "@storybook/react-vite"
import { FluxCardsGallery } from "./Gallery"

const meta = {
  title: "Flux/Stream cards",
  component: FluxCardsGallery,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FluxCardsGallery>
export default meta
export const DocumentViewerComplete: StoryObj<typeof meta> = {
  args: { type: "document-viewer", state: "complete" },
}
export const DocumentViewerPartial: StoryObj<typeof meta> = {
  args: { type: "document-viewer", state: "partial" },
}
export const DocumentViewerEmpty: StoryObj<typeof meta> = {
  args: { type: "document-viewer", state: "empty" },
}
export const DocumentViewerLong: StoryObj<typeof meta> = {
  args: { type: "document-viewer", state: "long" },
}
export const ReportCardComplete: StoryObj<typeof meta> = {
  args: { type: "report-card", state: "complete" },
}
export const ReportCardPartial: StoryObj<typeof meta> = {
  args: { type: "report-card", state: "partial" },
}
export const ReportCardEmpty: StoryObj<typeof meta> = {
  args: { type: "report-card", state: "empty" },
}
export const ReportCardLong: StoryObj<typeof meta> = {
  args: { type: "report-card", state: "long" },
}
export const ErrorReportComplete: StoryObj<typeof meta> = {
  args: { type: "error-report", state: "complete" },
}
export const ErrorReportPartial: StoryObj<typeof meta> = {
  args: { type: "error-report", state: "partial" },
}
export const ErrorReportEmpty: StoryObj<typeof meta> = {
  args: { type: "error-report", state: "empty" },
}
export const ErrorReportLong: StoryObj<typeof meta> = {
  args: { type: "error-report", state: "long" },
}
export const ApprovalCardComplete: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "complete" },
}
export const ApprovalCardPartial: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "partial" },
}
export const ApprovalCardEmpty: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "empty" },
}
export const ApprovalCardLong: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "long" },
}
export const ProposalCardComplete: StoryObj<typeof meta> = {
  args: { type: "proposal-card", state: "complete" },
}
export const ProposalCardPartial: StoryObj<typeof meta> = {
  args: { type: "proposal-card", state: "partial" },
}
export const ProposalCardEmpty: StoryObj<typeof meta> = {
  args: { type: "proposal-card", state: "empty" },
}
export const ProposalCardLong: StoryObj<typeof meta> = {
  args: { type: "proposal-card", state: "long" },
}
export const InfoCardComplete: StoryObj<typeof meta> = {
  args: { type: "info-card", state: "complete" },
}
export const InfoCardPartial: StoryObj<typeof meta> = {
  args: { type: "info-card", state: "partial" },
}
export const InfoCardEmpty: StoryObj<typeof meta> = { args: { type: "info-card", state: "empty" } }
export const InfoCardLong: StoryObj<typeof meta> = { args: { type: "info-card", state: "long" } }
export const ListCardComplete: StoryObj<typeof meta> = {
  args: { type: "list-card", state: "complete" },
}
export const ListCardPartial: StoryObj<typeof meta> = {
  args: { type: "list-card", state: "partial" },
}
export const ListCardEmpty: StoryObj<typeof meta> = { args: { type: "list-card", state: "empty" } }
export const ListCardLong: StoryObj<typeof meta> = { args: { type: "list-card", state: "long" } }
export const MetricCardComplete: StoryObj<typeof meta> = {
  args: { type: "metric-card", state: "complete" },
}
export const MetricCardPartial: StoryObj<typeof meta> = {
  args: { type: "metric-card", state: "partial" },
}
export const MetricCardEmpty: StoryObj<typeof meta> = {
  args: { type: "metric-card", state: "empty" },
}
export const MetricCardLong: StoryObj<typeof meta> = {
  args: { type: "metric-card", state: "long" },
}
export const ProgressCardComplete: StoryObj<typeof meta> = {
  args: { type: "progress-card", state: "complete" },
}
export const ProgressCardPartial: StoryObj<typeof meta> = {
  args: { type: "progress-card", state: "partial" },
}
export const ProgressCardEmpty: StoryObj<typeof meta> = {
  args: { type: "progress-card", state: "empty" },
}
export const ProgressCardLong: StoryObj<typeof meta> = {
  args: { type: "progress-card", state: "long" },
}
export const ConfirmationCardComplete: StoryObj<typeof meta> = {
  args: { type: "confirmation-card", state: "complete" },
}
export const ConfirmationCardPartial: StoryObj<typeof meta> = {
  args: { type: "confirmation-card", state: "partial" },
}
export const ConfirmationCardEmpty: StoryObj<typeof meta> = {
  args: { type: "confirmation-card", state: "empty" },
}
export const ConfirmationCardLong: StoryObj<typeof meta> = {
  args: { type: "confirmation-card", state: "long" },
}
export const TableCardComplete: StoryObj<typeof meta> = {
  args: { type: "table-card", state: "complete" },
}
export const TableCardPartial: StoryObj<typeof meta> = {
  args: { type: "table-card", state: "partial" },
}
export const TableCardEmpty: StoryObj<typeof meta> = {
  args: { type: "table-card", state: "empty" },
}
export const TableCardLong: StoryObj<typeof meta> = { args: { type: "table-card", state: "long" } }
export const TimelineCardComplete: StoryObj<typeof meta> = {
  args: { type: "timeline-card", state: "complete" },
}
export const TimelineCardPartial: StoryObj<typeof meta> = {
  args: { type: "timeline-card", state: "partial" },
}
export const TimelineCardEmpty: StoryObj<typeof meta> = {
  args: { type: "timeline-card", state: "empty" },
}
export const TimelineCardLong: StoryObj<typeof meta> = {
  args: { type: "timeline-card", state: "long" },
}
export const DiffCardComplete: StoryObj<typeof meta> = {
  args: { type: "diff-card", state: "complete" },
}
export const DiffCardPartial: StoryObj<typeof meta> = {
  args: { type: "diff-card", state: "partial" },
}
export const DiffCardEmpty: StoryObj<typeof meta> = { args: { type: "diff-card", state: "empty" } }
export const DiffCardLong: StoryObj<typeof meta> = { args: { type: "diff-card", state: "long" } }
export const ArtifactMiniComplete: StoryObj<typeof meta> = {
  args: { type: "artifact-mini", state: "complete" },
}
export const ArtifactMiniPartial: StoryObj<typeof meta> = {
  args: { type: "artifact-mini", state: "partial" },
}
export const ArtifactMiniEmpty: StoryObj<typeof meta> = {
  args: { type: "artifact-mini", state: "empty" },
}
export const ArtifactMiniLong: StoryObj<typeof meta> = {
  args: { type: "artifact-mini", state: "long" },
}
export const SessionTaskComplete: StoryObj<typeof meta> = {
  args: { type: "session-task", state: "complete" },
}
export const SessionTaskPartial: StoryObj<typeof meta> = {
  args: { type: "session-task", state: "partial" },
}
export const SessionTaskEmpty: StoryObj<typeof meta> = {
  args: { type: "session-task", state: "empty" },
}
export const SessionTaskLong: StoryObj<typeof meta> = {
  args: { type: "session-task", state: "long" },
}
export const SubagentSpawnApprovalComplete: StoryObj<typeof meta> = {
  args: { type: "subagent-spawn-approval", state: "complete" },
}
export const SubagentSpawnApprovalPartial: StoryObj<typeof meta> = {
  args: { type: "subagent-spawn-approval", state: "partial" },
}
export const SubagentSpawnApprovalEmpty: StoryObj<typeof meta> = {
  args: { type: "subagent-spawn-approval", state: "empty" },
}
export const SubagentSpawnApprovalLong: StoryObj<typeof meta> = {
  args: { type: "subagent-spawn-approval", state: "long" },
}
export const ChatLoopTerminatedComplete: StoryObj<typeof meta> = {
  args: { type: "chat-loop-terminated", state: "complete" },
}
export const ChatLoopTerminatedPartial: StoryObj<typeof meta> = {
  args: { type: "chat-loop-terminated", state: "partial" },
}
export const ChatLoopTerminatedEmpty: StoryObj<typeof meta> = {
  args: { type: "chat-loop-terminated", state: "empty" },
}
export const ChatLoopTerminatedLong: StoryObj<typeof meta> = {
  args: { type: "chat-loop-terminated", state: "long" },
}
export const ElicitationPromptComplete: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "complete" },
}
export const ElicitationPromptPartial: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "partial" },
}
export const ElicitationPromptEmpty: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "empty" },
}
export const ElicitationPromptLong: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "long" },
}
export const ApprovalCardApproved: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "approved" },
}
export const ApprovalCardRejected: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "rejected" },
}
export const ApprovalCardHandling: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "handling" },
}
export const ApprovalCardFailed: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "failed" },
}
export const ApprovalCardFutureResolution: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "future-resolution" },
}
export const SubagentSpawnApprovalApproved: StoryObj<typeof meta> = {
  args: { type: "subagent-spawn-approval", state: "approved" },
}
export const SubagentSpawnApprovalRejected: StoryObj<typeof meta> = {
  args: { type: "subagent-spawn-approval", state: "rejected" },
}
export const SubagentSpawnApprovalHandling: StoryObj<typeof meta> = {
  args: { type: "subagent-spawn-approval", state: "handling" },
}
export const SubagentSpawnApprovalFailed: StoryObj<typeof meta> = {
  args: { type: "subagent-spawn-approval", state: "failed" },
}
export const SubagentSpawnApprovalFutureResolution: StoryObj<typeof meta> = {
  args: { type: "subagent-spawn-approval", state: "future-resolution" },
}
export const ProposalCardApplied: StoryObj<typeof meta> = {
  args: { type: "proposal-card", state: "applied" },
}
export const ProposalCardDismissed: StoryObj<typeof meta> = {
  args: { type: "proposal-card", state: "dismissed" },
}
export const ProposalCardHandling: StoryObj<typeof meta> = {
  args: { type: "proposal-card", state: "handling" },
}
export const ProposalCardFailed: StoryObj<typeof meta> = {
  args: { type: "proposal-card", state: "failed" },
}
export const ProposalCardFutureResolution: StoryObj<typeof meta> = {
  args: { type: "proposal-card", state: "future-resolution" },
}
export const ElicitationPromptApproved: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "approved" },
}
export const ElicitationPromptRejected: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "rejected" },
}
export const ElicitationPromptHandling: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "handling" },
}
export const ElicitationPromptFailed: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "failed" },
}
export const ElicitationPromptFutureResolution: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "future-resolution" },
}
export const ElicitationString: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "string" },
}
export const ElicitationDeclined: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "declined" },
}
export const ElicitationCanceled: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "canceled" },
}
export const ElicitationExpired: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "expired" },
}
export const AccessLoading: StoryObj<typeof meta> = { args: { access: "loading" } }
export const AccessUnavailable: StoryObj<typeof meta> = { args: { access: "unavailable" } }
export const AccessDenied: StoryObj<typeof meta> = { args: { access: "denied" } }
export const AccessLocked: StoryObj<typeof meta> = { args: { access: "locked" } }
export const AccessUnknown: StoryObj<typeof meta> = { args: { access: "unknown" } }
export const ToolsIndicator: StoryObj<typeof meta> = { args: { mode: "indicator" } }
export const ToolsMinimal: StoryObj<typeof meta> = { args: { mode: "minimal" } }
export const ToolsCompact: StoryObj<typeof meta> = { args: { mode: "compact" } }
export const ToolsFull: StoryObj<typeof meta> = { args: { mode: "full" } }

export const TableActions: StoryObj<typeof meta> = {
  args: { type: "table-card", state: "actions" },
}
export const ReportActions: StoryObj<typeof meta> = {
  args: { type: "report-card", state: "actions" },
}
export const UnresolvedList: StoryObj<typeof meta> = {
  args: { type: "list-card", state: "data-source" },
}
export const UnaddressedApproval: StoryObj<typeof meta> = {
  args: { type: "approval-card", state: "unaddressed" },
}
export const MetricZero: StoryObj<typeof meta> = { args: { type: "metric-card", state: "zero" } }
export const ProgressZero: StoryObj<typeof meta> = {
  args: { type: "progress-card", state: "zero" },
}

export const ElicitationAccepted: StoryObj<typeof meta> = {
  args: { type: "elicitation-prompt", state: "accepted" },
}
