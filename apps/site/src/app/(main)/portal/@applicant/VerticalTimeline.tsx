import React from "react";
import { PortalStatus } from "./ApplicantPortal";
import { SubmissionComponent } from "./components/Submission";
import { VerdictComponent } from "./components/Verdict";
import { WaiverComponent } from "./components/Waiver";
import { RSVPComponent } from "./components/RSVP";

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
