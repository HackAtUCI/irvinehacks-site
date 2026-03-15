import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";

import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import haveApplicationsOpened from "@/lib/utils/haveApplicationsOpened";

import ApplicationsClosed from "./ApplicationsClosed/ApplicationsClosed";
import ApplyConfirm from "./ApplyConfirmation/ApplyConfirm";
import Title from "./Title/Title";
import getUserIdentity from "@/lib/utils/getUserIdentity";

export const revalidate = 60;

interface ApplicationFlowProps {
	prefaceAccepted?: string;
	applicationType: "Hacker" | "Mentor" | "Volunteer";
	applicationURL: "/apply" | "/mentor" | "/volunteer";
}

export default async function ApplicationFlow({
	prefaceAccepted,
	applicationType,
	applicationURL,
	children,
}: ApplicationFlowProps & PropsWithChildren) {
	const hasAcceptedQueryParam = prefaceAccepted === "true";
	const identity = await getUserIdentity();

	if (identity.status !== null) {
		redirect("/portal");
	}

	if (hasAcceptedQueryParam && identity.uid === null) {
		redirect("/login");
	}

	const deadlinePassed = hasDeadlinePassed();
	const applicationsOpened = haveApplicationsOpened();
	const applyBody = hasAcceptedQueryParam ? (
		<div className="w-full max-w-4xl px-4 sm:px-6 md:px-8 my-32 mx-auto">
			<Title applicationType={applicationType} />
			<div className="flex justify-center w-full">{children}</div>
		</div>
	) : (
		<ApplyConfirm applicationURL={applicationURL} role={applicationType} />
	);
	return (
		<div className="flex flex-col items-center justify-center gap-10 min-h-screen">
			{!applicationsOpened || deadlinePassed ? (
				<ApplicationsClosed />
			) : (
				applyBody
			)}
		</div>
	);
}
