import Image from "next/image";
import { TimelineComponent } from "./TimelineComponent";
import { Status } from "@/lib/userRecord";
import PortalCheck from "@/assets/icons/portal-check.svg";
import PortalWarning from "@/assets/icons/portal-warning.png";

export const RSVPComponent = ({ status }: { status: Status }) => {
	let verdict = null;

	if (status === Status.Accepted || status === Status.Signed) {
		verdict = {
			text: "Confirm Attendance",
			finished: false,
		};
	} else if (status === Status.Confirmed || status === Status.Attending) {
		verdict = {
			text: "Attendance Confirmed",
			finished: true,
		};
	} else if (status === Status.Void) {
		verdict = {
			text: "No RSVP Indicated",
			finished: false,
		};
	}

	if (!verdict) return null;

	return (
		<div className="flex items-center gap-4 md:gap-6">
			<TimelineComponent
				text={verdict.text}
				finished={verdict.finished}
				statusIcon="Pending"
			/>
			<Image
				src={verdict.finished ? PortalCheck : PortalWarning}
				alt={verdict.finished ? "Completed" : "Pending"}
				width={178}
				height={178}
				className="w-16 h-16 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] flex-shrink-0"
			/>
		</div>
	);
};
