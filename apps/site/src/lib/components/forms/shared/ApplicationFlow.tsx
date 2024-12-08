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
	searchParams?: {
		prefaceAccepted?: string;
	};
	applicationType: "Hacker" | "Mentor" | "Volunteer";
	continueHREF: string;
	isHacker: boolean;
}

export default async function ApplicationFlow({
	searchParams,
	applicationType,
	continueHREF,
	isHacker,
	children,
}: ApplicationFlowProps & PropsWithChildren) {
	const hasAcceptedQueryParam = searchParams?.prefaceAccepted === "true";
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
		<>
			<Title applicationType={applicationType} />
			<div className="flex justify-center">{children}</div>
		</>
	) : (
		<ApplyConfirm continueHREF={continueHREF} isHacker={isHacker} />
	);
	return (
		<div className="flex flex-col items-center gap-10 my-32 min-h-[calc(100vh-8rem)]">
			{!applicationsOpened || deadlinePassed ? (
				<ApplicationsClosed />
			) : (
				applyBody
			)}
		</div>
	);
}
