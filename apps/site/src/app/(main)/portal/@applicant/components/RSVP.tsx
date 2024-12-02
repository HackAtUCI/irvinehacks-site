import { TimelineComponent } from "./TimelineComponent";
import { PortalStatus } from ".././ApplicantPortal";
import { StatusImageProps } from "./StatusImage";

export const RSVPComponent = ({ status }: { status: PortalStatus }) => {
	let verdict = null;

	if (status === PortalStatus.accepted || status === PortalStatus.waived) {
		verdict = {
			text: "Confirm Attendance",
			finished: false,
			statusIcon: "Pending",
		};
	} else if (
		status === PortalStatus.confirmed ||
		status === PortalStatus.attending
	) {
		verdict = {
			text: "Attendance Confirmed",
			finished: true,
			statusIcon: "Accepted",
		};
	} else if (status === PortalStatus.void) {
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
