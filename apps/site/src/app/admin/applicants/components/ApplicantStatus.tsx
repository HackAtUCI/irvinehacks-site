import StatusIndicator, {
	StatusIndicatorProps,
} from "@cloudscape-design/components/status-indicator";

import { Status } from "admin/utils/useApplicant";

export const StatusLabels = {
	[Status.accepted]: "accepted",
	[Status.rejected]: "rejected",
	[Status.waitlisted]: "waitlisted",
	[Status.pending]: "needs review",
	[Status.reviewed]: "reviewed",
	[Status.released]: "released",
};

const StatusTypes: Record<Status, StatusIndicatorProps.Type> = {
	[Status.accepted]: "success",
	[Status.rejected]: "error",
	[Status.waitlisted]: "pending",
	[Status.pending]: "pending",
	[Status.reviewed]: "in-progress",
	[Status.released]: "success",
};

interface ApplicantStatusProps {
	status: Status;
}

function ApplicantStatus({ status }: ApplicantStatusProps) {
	return (
		<StatusIndicator type={StatusTypes[status]}>
			{StatusLabels[status]}
		</StatusIndicator>
	);
}

export default ApplicantStatus;
