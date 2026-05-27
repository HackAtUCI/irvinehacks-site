import React from "react";
import { Decision, Status } from "@/lib/userRecord";
import { SubmissionComponent } from "./SubmissionComponent";
import { VerdictComponent } from "./VerdictComponent";
import { RSVPComponent } from "./RSVPComponent";
// import { WaiverComponent } from "./WaiverComponent";

interface VerticalTimelineProps {
	status: Status;
	decision?: Decision | null;
}

function VerticalTimeline({ status, decision }: VerticalTimelineProps) {
	const verdictStatus = decision ?? status;

	return (
		<div className="flex flex-col gap-6 md:gap-10">
			<SubmissionComponent />
			<VerdictComponent status={verdictStatus} />
			<RSVPComponent status={status} />
			{/* <WaiverComponent status={status} /> */}
		</div>
	);
}

export default VerticalTimeline;
