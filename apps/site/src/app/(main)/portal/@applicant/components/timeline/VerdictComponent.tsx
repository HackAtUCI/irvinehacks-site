import { TimelineComponent } from "./TimelineComponent";
import { Status } from "@/lib/userRecord";
import { StatusImageProps } from "./StatusImage";

export const VerdictComponent = ({ status }: { status: Status }) => {
	let verdict: {
		text: string;
		finished: boolean;
		statusIcon: StatusImageProps["statusIcon"];
	} | null = null;

	switch (status) {
		case Status.Accepted:
		case Status.Void:
		case Status.Signed:
		case Status.Confirmed:
		case Status.Attending: {
			verdict = {
				text: "Application Accepted",
				finished: true,
				statusIcon: "Accepted",
			};
			break;
		}
		case Status.Rejected: {
			verdict = {
				text: "Application Rejected",
				finished: true,
				statusIcon: "Rejected",
			};
			break;
		}

		case Status.Waitlisted: {
			verdict = {
				text: "Application Waitlisted",
				finished: true,
				statusIcon: "Pending",
			};
			break;
		}
		case Status.Pending:
		case Status.Reviewed: {
			verdict = {
				text: "Application Under Review",
				finished: true,
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
		<TimelineComponent
			text={verdict.text}
			finished={verdict.finished}
			statusIcon={verdict.statusIcon}
		/>
	) : null;
};
