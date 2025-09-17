"use client";

import { redirect } from "next/navigation";

import useUserIdentity from "@/lib/utils/useUserIdentity";

import ConfirmAttendance from "./components/ConfirmAttendance";
import Message from "./components/Message";
import SignWaiver from "./components/SignWaiver";
import ReturnHome from "./components/ReturnHome";
import VerticalTimeline from "./components/timeline/VerticalTimeline";
import BackgroundStars from "./components/BackgroundStars";
import QRCodeComponent from "./components/QRCode";

// TODO: use common Status enum from userRecord.ts

export const enum PortalStatus {
	pending = "PENDING_REVIEW",
	reviewed = "REVIEWED",
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	waitlisted = "WAITLISTED",
	waived = "WAIVER_SIGNED",
	confirmed = "CONFIRMED",
	attending = "ATTENDING",
	void = "VOID",
}

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
		status === PortalStatus.waived ||
		status === PortalStatus.confirmed ||
		status === PortalStatus.attending;

	const needsToSignWaiver = status === PortalStatus.accepted;
	const rejected = status === PortalStatus.rejected;

	return (
		<div className="relative">
			<BackgroundStars className="left-[-15%] top-[21%]" />
			<div className="bg-transparent text-black max-w-6xl rounded-2xl p-6 flex flex-col mb-24 w-full">
				<div className="mb-12">
					<QRCodeComponent
						className="max-w-xs mx-auto"
						size={180}
						includeEventInfo={true}
					/>
				</div>

				<h2 className="font-bold font-display text-[var(--color-white)] mb-4 md:mb-[42px] text-[15px] sm:text-2xl md:text-[40px] md:leading-10">
					{roleToDisplay} Application Status
				</h2>
				<VerticalTimeline status={status as PortalStatus} />
				<Message status={status as PortalStatus} />
				{needsToSignWaiver && <SignWaiver />}
				{submittedWaiver && (
					<ConfirmAttendance status={status as PortalStatus} />
				)}
				{rejected && <ReturnHome />}
			</div>
			<BackgroundStars className="right-[-15%] bottom-[21%]" />
		</div>
	);
}

export default Portal;
