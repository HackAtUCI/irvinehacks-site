import { TimelineComponent } from "./TimelineComponent";
import { PostAcceptedStatus, Status } from "@/lib/userRecord";
import { StatusImageProps } from "./StatusImage";

export const VerdictComponent = ({ status }: { status: Status }) => {
	let verdict: {
		text: string;
		statusIcon: StatusImageProps["statusIcon"];
	} | null = null;

	switch (status) {
		case Status.Accepted:
		case Status.Signed:
		case Status.Confirmed:
		case Status.Attending: {
			verdict = {
				text: "Application Accepted",
				statusIcon: "Accepted",
			};
			break;
		}
		case Status.Rejected: {
			verdict = {
				text: "Application Rejected",
				statusIcon: "Rejected",
			};
			break;
		}

		case Status.Waitlisted:
		case PostAcceptedStatus.Queued: {
			verdict = {
				text: "Application Waitlisted",
				statusIcon: "Pending",
			};
			break;
		}
		case Status.Pending:
		case Status.Reviewed: {
			verdict = {
				text: "Application Under Review",
				statusIcon: "Pending",
			};
			break;
		}
		default: {
			const exhaustiveCheck: never = status;
			throw new Error(`Unhandled status: ${exhaustiveCheck}`);
		}
	}

	return verdict ? (
		<TimelineComponent text={verdict.text} statusIcon={verdict.statusIcon} />
	) : null;
};
