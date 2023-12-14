export { default as default } from "./Portal";
import Head from "next/head";
import axios from "axios";

import styles from "./Portal.module.scss";

import VerticalTimeline from "./VerticalTimeline";
import Message from "./Message";

export const enum PortalStatus {
	pending = "PENDING_REVIEW",
	reviewed = "REVIEWED",
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	waitlisted = "WAITLISTED",
	confirmed = "CONFIRMED",
}

export default async function Portal() {
	// const res = await axios.get(`/api/user/me`);
	// const identity = res.data;

	const status = PortalStatus.pending;

	return (
		<>
			<section className=" w-full flex items-center flex-col">
				<div className="m-24">
					<Head>
						<title>Portal | IrvineHacks 2024</title>
					</Head>
					<h1
						className={`${styles.title} font-display sm:text-[3rem] text-[#fffce2] text-6xl text-center`}
					>
						Portal
					</h1>
				</div>
				<div className="bg-white text-black max-w-4xl rounded-2xl p-6 flex flex-col mb-24 w-full">
					<h2 className="text-4xl font-semibold">Status</h2>
					<VerticalTimeline status={status} />
					<Message status={status as PortalStatus} />
				</div>
			</section>
		</>
	);
}
