import React from "react";
import { Status } from "@/lib/userRecord";
import { SubmissionComponent } from "./SubmissionComponent";
import { VerdictComponent } from "./VerdictComponent";
import { RSVPComponent } from "./RSVPComponent";
// import { WaiverComponent } from "./WaiverComponent";

interface VerticalTimelineProps {
	status: Status;
}

function VerticalTimeline({ status }: VerticalTimelineProps) {
	return (
		<div className="flex flex-col gap-6 md:gap-10">
			<SubmissionComponent />
			<VerdictComponent status={status} />
			<RSVPComponent status={status} />
			{/* <WaiverComponent status={status} /> */}
		</div>
	);
}

export default VerticalTimeline;
