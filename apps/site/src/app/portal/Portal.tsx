"use client";

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { useEffect } from "react";

import VerticalTimeline from "./VerticalTimeline";
import Message from "./Message";
import { Identity } from "@/lib/utils/getUserIdentity";

import styles from "./Portal.module.scss";

export const enum PortalStatus {
	pending = "PENDING_REVIEW",
	reviewed = "REVIEWED",
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	waitlisted = "WAITLISTED",
	confirmed = "CONFIRMED",
}

interface PortalProps {
	identity: Identity;
}

export const metadata: Metadata = {
	title: "Portal | IrvineHacks 2024",
};

function Portal({ identity }: PortalProps) {
	const status = identity.status;

	useEffect(() => {
		if (status === null) {
			redirect("/apply");
		}
	}, [status]);

	if (status === null) {
		return null;
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
					<VerticalTimeline status={status} />
					<Message status={status as PortalStatus} />
				</div>
			</section>
		</>
	);
}

export default Portal;
