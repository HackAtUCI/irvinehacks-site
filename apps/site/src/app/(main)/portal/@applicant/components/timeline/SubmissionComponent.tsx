import Image from "next/image";
import { TimelineComponent } from "./TimelineComponent";
import PortalCheck from "@/assets/icons/portal-check.svg";

export const SubmissionComponent = () => {
	return (
		<div className="flex items-center gap-4 md:gap-6">
			<TimelineComponent
				text="Application Submitted"
				finished={true}
				statusIcon="Accepted"
			/>
			<Image
				src={PortalCheck}
				alt="Completed"
				width={178}
				height={178}
				className="w-16 h-16 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] flex-shrink-0"
			/>
		</div>
	);
};
