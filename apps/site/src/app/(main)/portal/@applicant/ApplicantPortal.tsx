import { redirect } from "next/navigation";

import getUserIdentity from "@/lib/utils/getUserIdentity";

import ConfirmAttendance from "./ConfirmAttendance";
import Message from "./Message";
import SignWaiver from "./SignWaiver";
import VerticalTimeline from "./VerticalTimeline";

export const enum PortalStatus {
	pending = "PENDING_REVIEW",
	reviewed = "REVIEWED",
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	waitlisted = "WAITLISTED",
	waived = "WAIVER_SIGNED",
	confirmed = "CONFIRMED",
	attending = "ATTENDING",
}

async function Portal() {
	const identity = await getUserIdentity();
	const status = identity.status;

	if (status === null) {
		redirect("/apply");
	}

	const submittedWaiver =
		status === PortalStatus.waived ||
		status === PortalStatus.confirmed ||
		status === PortalStatus.attending;

	const needsToSignWaiver = status === PortalStatus.accepted;

	const moreContent = needsToSignWaiver || submittedWaiver;

	return (
		<div className="bg-white text-black max-w-4xl rounded-2xl p-6 flex flex-col mb-24 w-full">
			<h2 className="text-4xl font-semibold">Status</h2>
			<VerticalTimeline status={status as PortalStatus} />
			<Message status={status as PortalStatus} />
			{moreContent && <hr />}
			{needsToSignWaiver && <SignWaiver />}
			{submittedWaiver && <ConfirmAttendance status={status} />}
		</div>
	);
}

export default Portal;
