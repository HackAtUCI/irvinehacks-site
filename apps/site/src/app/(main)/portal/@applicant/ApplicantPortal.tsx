import { redirect } from "next/navigation";

import getUserIdentity from "@/lib/utils/getUserIdentity";

import ConfirmAttendance from "./components/ConfirmAttendance";
import Message from "./components/Message";
import SignWaiver from "./components/SignWaiver";
import ReturnHome from "./components/ReturnHome";
import VerticalTimeline from "./components/timeline/VerticalTimeline";
import BackgroundStars from "./components/BackgroundStars";

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

async function Portal({
	searchParams,
}: {
	searchParams?: {
		return_to?: string;
	};
}) {
	const identity = await getUserIdentity();
	const status = identity.status;

	if (status === null) {
		if (searchParams?.return_to === undefined) {
			redirect("/");
		} else if (
			searchParams?.return_to !== undefined &&
			searchParams.return_to !== "/portal"
		) {
			redirect(searchParams.return_to);
		} else {
			redirect("/");
		}
	}

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
				<h2 className="font-bold font-display text-[var(--color-white)] mb-4 md:mb-[42px] text-[15px] sm:text-2xl md:text-[40px] md:leading-10">
					Status
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
