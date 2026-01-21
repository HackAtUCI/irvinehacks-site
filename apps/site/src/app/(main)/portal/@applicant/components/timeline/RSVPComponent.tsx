import { TimelineComponent } from "./TimelineComponent";
import { Status } from "@/lib/userRecord";
import { StatusImageProps } from "./StatusImage";

export const RSVPComponent = ({ status }: { status: Status }) => {
	let verdict = null;

	if (status === Status.Accepted || status === Status.Signed) {
		verdict = {
			text: "Confirm Attendance",
			finished: false,
			statusIcon: "Pending",
		};
	} else if (status === Status.Confirmed || status === Status.Attending) {
		verdict = {
			text: "Attendance Confirmed",
			finished: true,
			statusIcon: "Accepted",
		};
	} else if (status === Status.Void) {
		verdict = {
			text: "No RSVP Indicated",
			finished: false,
			statusIcon: "Pending",
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
