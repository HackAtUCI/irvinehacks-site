import { TimelineComponent } from "./TimelineComponent";
import { Status } from "@/lib/userRecord";
import { StatusImageProps } from "./StatusImage";

export const RSVPComponent = ({ status }: { status: Status }) => {
	let verdict = null;

	if (status === Status.Accepted || status === Status.Signed) {
		verdict = {
			text: "Confirm Attendance",
			statusIcon: "Pending",
		};
	} else if (status === Status.Confirmed || status === Status.Attending) {
		verdict = {
			text: "Attendance Confirmed",
			statusIcon: "Accepted",
		};
	}

	return verdict ? (
		<TimelineComponent
			text={verdict.text}
			statusIcon={verdict.statusIcon as StatusImageProps["statusIcon"]}
		/>
	) : null;
};
