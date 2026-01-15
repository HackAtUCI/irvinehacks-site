import Image from "next/image";
import { TimelineComponent } from "./TimelineComponent";
import { Status } from "@/lib/userRecord";
import PortalCheck from "@/assets/icons/portal-check.svg";
import PortalWarning from "@/assets/icons/portal-warning.png";

export const WaiverComponent = ({ status }: { status: Status }) => {
	let verdict = null;

	if (status === Status.Accepted) {
		verdict = {
			text: "Sign Waiver",
			finished: false,
		};
	} else if (
		status === Status.Signed ||
		status === Status.Attending ||
		status === Status.Confirmed
	) {
		verdict = {
			text: "Waiver Signed",
			finished: true,
		};
	}

	if (!verdict) return null;

	return (
		<div className="flex items-center gap-6 md:gap-10">
			<TimelineComponent
				text={verdict.text}
				finished={verdict.finished}
				statusIcon="Pending"
			/>
			<Image
				src={verdict.finished ? PortalCheck : PortalWarning}
				alt={verdict.finished ? "Completed" : "Pending"}
				width={verdict.finished ? 178 : 108}
				height={verdict.finished ? 178 : 94}
				className={verdict.finished
					? "w-16 h-16 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] flex-shrink-0"
					: "w-12 h-10 sm:w-16 sm:h-14 md:w-[108px] md:h-[94px] flex-shrink-0"
				}
			/>
		</div>
	);
};
