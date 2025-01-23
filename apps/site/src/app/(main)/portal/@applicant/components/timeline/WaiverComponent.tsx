import { TimelineComponent } from "./TimelineComponent";
import { Status } from "@/lib/userRecord";
import { StatusImageProps } from "./StatusImage";

export const WaiverComponent = ({ status }: { status: Status }) => {
	let verdict = null;

	if (status === Status.Accepted) {
		verdict = {
			text: "Sign Waiver",
			finished: false,
			statusIcon: "Pending",
		};
	} else if (
		status === Status.Signed ||
		status === Status.Attending ||
		status === Status.Confirmed
	) {
		verdict = {
			text: "Waiver Signed",
			finished: true,
			statusIcon: "Accepted",
		};
	}
	return verdict ? (
		<TimelineComponent
			text={verdict.text}
			finished={verdict.finished}
			statusIcon={verdict.statusIcon as StatusImageProps["statusIcon"]}
		/>
	) : null;
};
