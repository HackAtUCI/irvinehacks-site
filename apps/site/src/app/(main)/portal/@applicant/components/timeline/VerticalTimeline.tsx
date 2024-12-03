import React from "react";
import { PortalStatus } from "../../ApplicantPortal";
import { SubmissionComponent } from "./Submission";
import { VerdictComponent } from "./Verdict";
import { WaiverComponent } from "./Waiver";
import { RSVPComponent } from "./RSVP";

interface VerticalTimelineProps {
	status: PortalStatus;
}

function VerticalTimeline({ status }: VerticalTimelineProps) {
	return (
		<div className="">
			<SubmissionComponent />
			<VerdictComponent status={status} />
			<WaiverComponent status={status} />
			<RSVPComponent status={status} />
		</div>
	);
}

export default VerticalTimeline;
