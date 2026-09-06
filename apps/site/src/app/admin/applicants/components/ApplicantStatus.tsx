import StatusIndicator, {
	StatusIndicatorProps,
} from "@cloudscape-design/components/status-indicator";

import { Decision, Status } from "@/lib/userRecord";

export const StatusLabels = {
	[Status.Accepted]: "accepted",
	[Status.Rejected]: "rejected",
	[Status.Waitlisted]: "waitlisted",
	[Status.Voided]: "voided",
	[Status.Pending]: "needs review",
	[Status.Reviewed]: "reviewed",
	[Status.Signed]: "waiver signed",
	[Status.Confirmed]: "confirmed",
	[Status.Attending]: "attending",
	[Status.Queued]: "queued",
};

type ApplicantStatusValue = Status | Decision;

const StatusTypes: Record<ApplicantStatusValue, StatusIndicatorProps.Type> = {
	[Status.Accepted]: "success",
	[Status.Rejected]: "error",
	[Status.Waitlisted]: "pending",
	[Status.Voided]: "stopped",
	[Status.Pending]: "pending",
	[Status.Reviewed]: "in-progress",
	[Status.Signed]: "in-progress",
	[Status.Confirmed]: "info",
	[Status.Attending]: "success",
	[Status.Queued]: "pending",
};

interface ApplicantStatusProps {
	status: ApplicantStatusValue;
}

function ApplicantStatus({ status }: ApplicantStatusProps) {
	return (
		<StatusIndicator
			type={StatusTypes[status]}
			colorOverride={status === Status.Signed ? "blue" : undefined}
		>
			{StatusLabels[status]}
		</StatusIndicator>
	);
}

export default ApplicantStatus;
