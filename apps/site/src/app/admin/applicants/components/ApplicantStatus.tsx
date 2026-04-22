import StatusIndicator, {
	StatusIndicatorProps,
} from "@cloudscape-design/components/status-indicator";

import { Status } from "@/lib/userRecord";

export const StatusLabels: Record<Status, string> & { VOIDED: string } = {
	[Status.Accepted]: "accepted",
	[Status.Rejected]: "rejected",
	[Status.Waitlisted]: "waitlisted",
	[Status.Pending]: "needs review",
	[Status.Reviewed]: "reviewed",
	[Status.Signed]: "waiver signed",
	[Status.Confirmed]: "confirmed",
	[Status.Attending]: "attending",
	[Status.Queued]: "queued",
	VOIDED: "void",
};

const StatusTypes: Record<Status, StatusIndicatorProps.Type> = {
	[Status.Accepted]: "success",
	[Status.Rejected]: "error",
	[Status.Waitlisted]: "pending",
	[Status.Pending]: "pending",
	[Status.Reviewed]: "in-progress",
	[Status.Signed]: "in-progress",
	[Status.Confirmed]: "info",
	[Status.Attending]: "success",
	[Status.Queued]: "pending",
};

interface ApplicantStatusProps {
	status: Status;
	isVoided?: boolean;
}

function ApplicantStatus({ status, isVoided }: ApplicantStatusProps) {
	if (isVoided) {
		return <StatusIndicator type="stopped">void</StatusIndicator>;
	}
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
