import React from "react";
import { PortalStatus } from "../../ApplicantPortal";
import { SubmissionComponent } from "./SubmissionComponent";
import { VerdictComponent } from "./VerdictComponent";
import { WaiverComponent } from "./WaiverComponent";
import { RSVPComponent } from "./RSVPComponent";

interface VerticalTimelineProps {
	status: PortalStatus;
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
