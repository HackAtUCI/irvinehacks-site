"use client";

import { redirect } from "next/navigation";

import useUserIdentity from "@/lib/utils/useUserIdentity";
import { Status } from "@/lib/userRecord";

import ConfirmAttendance from "./components/ConfirmAttendance";
import Message from "./components/Message";
import SignWaiver from "./components/SignWaiver";
import ReturnHome from "./components/ReturnHome";
import VerticalTimeline from "./components/timeline/VerticalTimeline";

const rolesArray = ["Mentor", "Hacker", "Volunteer"];

function Portal() {
	const identity = useUserIdentity();

	if (!identity) {
		return <div className="font-display text-4xl mt-5">Loading...</div>;
	}

	const status = identity.status;

	if (status === null) {
		redirect("/#apply");
	}

	const roleToDisplay = identity.roles.find((role) =>
		rolesArray.includes(role),
	);

	const submittedWaiver =
		status === Status.Signed ||
		status === Status.Confirmed ||
		status === Status.Attending;

	const needsToSignWaiver = status === Status.Accepted;
	const rejected = status === Status.Rejected;

	return (
		<div className="relative">
			<div className="bg-transparent text-black max-w-6xl rounded-2xl p-6 flex flex-col mb-24 w-full">
				<VerticalTimeline status={status as Status} />
				<Message status={status as Status} />
				{needsToSignWaiver && <SignWaiver />}
				{submittedWaiver && <ConfirmAttendance status={status as Status} />}
				{rejected && <ReturnHome />}
			</div>
		</div>
	);
}

export default Portal;
