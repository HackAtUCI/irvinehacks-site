import { redirect } from "next/navigation";

import getUserIdentity from "@/lib/utils/getUserIdentity";

import Message from "./Message";
import VerticalTimeline from "./VerticalTimeline";

export const enum PortalStatus {
	pending = "PENDING_REVIEW",
	reviewed = "REVIEWED",
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	waitlisted = "WAITLISTED",
	waived = "WAIVER_SIGNED",
	confirmed = "CONFIRMED",
}

async function Portal() {
	const identity = await getUserIdentity();
	const status = identity.status;

	if (status === null) {
		redirect("/apply");
	}

	return (
		<div className="bg-white text-black max-w-4xl rounded-2xl p-6 flex flex-col mb-24 w-full">
			<h2 className="text-4xl font-semibold">Status</h2>
			<VerticalTimeline status={status as PortalStatus} />
			<Message status={status as PortalStatus} />
		</div>
	);
}

export default Portal;
