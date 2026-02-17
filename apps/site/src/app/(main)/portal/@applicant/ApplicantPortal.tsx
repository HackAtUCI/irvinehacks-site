"use client";

import { redirect, useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import useUserIdentity from "@/lib/utils/useUserIdentity";
import { Status } from "@/lib/userRecord";

import ConfirmAttendance from "./components/ConfirmAttendance";
import Message from "./components/Message";
import SignWaiver from "./components/SignWaiver";
import ReturnHome from "./components/ReturnHome";
import VerticalTimeline from "./components/timeline/VerticalTimeline";
import QRCodeComponent from "./components/QRCode";
import AvatarDisplay from "./components/AvatarDisplay";

const rolesArray = ["Mentor", "Hacker", "Volunteer"];

function Portal() {
	const identity = useUserIdentity();
	const searchParams = useSearchParams();
	const router = useRouter();

	const signed = searchParams.get("signed");

	useEffect(() => {
		if (identity && signed === "82ebb8bc-c302-4dc0-ad62-4b8b516395ce") {
			router.push("/api/user/waiver");
		}
		if (identity) {
			const status = identity.status;

			if (status === null) {
				redirect("/#apply");
			}
		}
	}, [identity, signed, router]);

	if (!identity) {
		return <div className="font-display text-4xl mt-5">Loading...</div>;
	}

	const status = identity.status;

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
				<Message status={status as Status} />
				{needsToSignWaiver && <SignWaiver />}
				{submittedWaiver && <ConfirmAttendance status={status as Status} />}
				{rejected && <ReturnHome />}
			</div>
		</div>
	);
}

export default Portal;
