import React from "react";
import { Status } from "@/lib/userRecord";
import { SubmissionComponent } from "./SubmissionComponent";
import { VerdictComponent } from "./VerdictComponent";
import { WaiverComponent } from "./WaiverComponent";
import { RSVPComponent } from "./RSVPComponent";

interface VerticalTimelineProps {
	status: Status;
}

function VerticalTimeline({ status }: VerticalTimelineProps) {
	return (
		<div>
			<SubmissionComponent />
			<VerdictComponent status={status} />
			<WaiverComponent status={status} />
			<RSVPComponent status={status} />
		</div>
	);
}

export default VerticalTimeline;
