import { TimelineComponent } from "./TimelineComponent";
import { PortalStatus } from ".././ApplicantPortal";
import { StatusImageProps } from "./StatusImage";

export const VerdictComponent = ({ status }: { status: PortalStatus }) => {
	let verdict = null;

	if (
		status === PortalStatus.accepted ||
		status === PortalStatus.void ||
		status === PortalStatus.waived ||
		status === PortalStatus.confirmed ||
		status === PortalStatus.attending
	) {
		verdict = {
			text: "Application Accepted",
			finished: true,
			statusIcon: "Accepted",
		};
	} else if (status === PortalStatus.rejected) {
		verdict = {
			text: "Application Rejected",
			finished: true,
			statusIcon: "Rejected",
		};
	} else if (status === PortalStatus.waitlisted) {
		verdict = {
			text: "Application Waitlisted",
			finished: true,
			statusIcon: "Pending",
		};
	} else if (
		status === PortalStatus.pending ||
		status === PortalStatus.reviewed
	) {
		verdict = {
			text: "Application Under Review",
			finished: true,
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
