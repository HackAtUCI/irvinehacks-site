"use client";

import { redirect } from "next/navigation";

import useUserIdentity from "@/lib/utils/useUserIdentity";
import { Status } from "@/lib/userRecord";
import useWaitlistOpen from "@/lib/utils/useWaitlistOpen";

import ConfirmAttendance from "./components/ConfirmAttendance";
import Message from "./components/Message";
import SignWaiver from "./components/SignWaiver";
import ReturnHome from "./components/ReturnHome";
import VerticalTimeline from "./components/timeline/VerticalTimeline";
import QRCodeComponent from "./components/QRCode";
import AvatarDisplay from "./components/AvatarDisplay";
import DeclineAcceptance from "./components/DeclineAcceptance";

const rolesArray = ["Mentor", "Hacker", "Volunteer"];
const declineableStatuses: Status[] = [
	Status.Accepted,
	Status.Signed,
	Status.Confirmed,
];

function Portal() {
	const identity = useUserIdentity();
	const { waitlistStatus, isLoading: isWaitlistLoading } = useWaitlistOpen();

	if (!identity || isWaitlistLoading) {
		return <div className="font-display text-4xl mt-5">Loading...</div>;
	}

	const status = identity.status;

	if (status === null) {
		redirect("/#apply");
	}

	const roleToDisplay = identity.roles.find((role) =>
		rolesArray.includes(role),
	);

	const isAccepted = status === Status.Accepted;

	const waitlistStarted = waitlistStatus?.is_started ?? false;
	const hasSignedWaiver =
		status === Status.Signed ||
		status === Status.Confirmed ||
		status === Status.Attending;

	const needsToSignWaiver = isAccepted && !hasSignedWaiver;
	const showRSVP = status === Status.Signed || status === Status.Confirmed;

	const showReturnHome = status === Status.Rejected || status === Status.Voided;
	const canDeclineAcceptance =
		(roleToDisplay === "Hacker" || roleToDisplay === "Mentor") &&
		declineableStatuses.includes(status as Status);

	return (
		<div className="relative">
			<div className="bg-transparent text-black max-w-6xl rounded-2xl p-6 flex flex-col mb-24 w-full">
				<div className="mb-12">
					<QRCodeComponent className="max-w-xs mx-auto" size={180} />
					<p className="mt-4 text-white text-center">
						If selected to attend, please show this QR code to our staff to
						check-in.
					</p>
				</div>

				<h2 className="font-bold font-display text-[var(--color-white)] mb-4 md:mb-[42px] text-[15px] sm:text-2xl md:text-[40px] md:leading-10">
					{roleToDisplay} Application Status
				</h2>
				<AvatarDisplay />
				<VerticalTimeline status={status as Status} />
				<Message status={status as Status} waitlistStarted={waitlistStarted} />
				{needsToSignWaiver && <SignWaiver />}
				{showRSVP && <ConfirmAttendance status={status as Status} />}
				{canDeclineAcceptance && <DeclineAcceptance />}
				{showReturnHome && <ReturnHome />}
			</div>
		</div>
	);
}

export default Portal;
