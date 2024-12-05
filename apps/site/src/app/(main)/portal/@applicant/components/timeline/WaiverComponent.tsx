import { TimelineComponent } from "./TimelineComponent";
import { PortalStatus } from "../.././ApplicantPortal";
import { StatusImageProps } from "./StatusImage";

export const WaiverComponent = ({ status }: { status: PortalStatus }) => {
	let verdict = null;

	if (status === PortalStatus.accepted) {
		verdict = {
			text: "Sign Waiver",
			finished: false,
			statusIcon: "Pending",
		};
	} else if (
		status === PortalStatus.waived ||
		status === PortalStatus.attending ||
		status === PortalStatus.confirmed
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
