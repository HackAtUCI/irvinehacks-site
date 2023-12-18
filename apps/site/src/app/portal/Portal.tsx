import { redirect } from "next/navigation";

import VerticalTimeline from "./VerticalTimeline";
import Message from "./Message";
import getUserIdentity from "@/lib/utils/getUserIdentity";

import styles from "./Portal.module.scss";

export const enum PortalStatus {
	pending = "PENDING_REVIEW",
	reviewed = "REVIEWED",
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	waitlisted = "WAITLISTED",
	confirmed = "CONFIRMED",
}

async function Portal() {
	const identity = await getUserIdentity();
	const status = identity.status;

	if (status === null) {
		redirect("/apply");
	}

	return (
		<>
			<section className=" w-full flex items-center flex-col">
				<div className="m-24">
					<h1
						className={`${styles.title} font-display sm:text-[3rem] text-[#fffce2] text-6xl text-center`}
					>
						Portal
					</h1>
				</div>
				<div className="bg-white text-black max-w-4xl rounded-2xl p-6 flex flex-col mb-24 w-full">
					<h2 className="text-4xl font-semibold">Status</h2>
					<VerticalTimeline status={status as PortalStatus} />
					<Message status={status as PortalStatus} />
				</div>
			</section>
		</>
	);
}

export default Portal;
