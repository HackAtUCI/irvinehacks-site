import { TimelineComponent } from "./TimelineComponent";
import { Status } from "@/lib/userRecord";
import { StatusImageProps } from "./StatusImage";

export const WaiverComponent = ({ status }: { status: Status }) => {
	let verdict: {
		text: string;
		statusIcon: StatusImageProps["statusIcon"];
	} | null = null;

	if (status === Status.Accepted) {
		verdict = {
			text: "Sign Waiver",
			statusIcon: "Pending",
		};
	} else if (
		status === Status.Signed ||
		status === Status.Attending ||
		status === Status.Confirmed
	) {
		verdict = {
			text: "Waiver Signed",
			statusIcon: "Accepted",
		};
	}

	if (!verdict) return null;

	return (
		<TimelineComponent text={verdict.text} statusIcon={verdict.statusIcon} />
	);
};
