import Image from "next/image";
import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";

import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import haveApplicationsOpened from "@/lib/utils/haveApplicationsOpened";

import ApplicationsClosed from "./ApplicationsClosed/ApplicationsClosed";
import ApplyConfirm from "./ApplyConfirmation/ApplyConfirm";
import Title from "./Title/Title";
import getUserIdentity from "@/lib/utils/getUserIdentity";
import clouds from "@/assets/images/starry_clouds.png";

export const revalidate = 60;

interface ApplicationFlowProps {
	searchParams?: {
		prefaceAccepted?: string;
	};
	applicationType: "Hacker" | "Mentor" | "Volunteer";
	applicationURL: "/apply" | "/mentor" | "/volunteer";
}

export default async function ApplicationFlow({
	searchParams,
	applicationType,
	applicationURL,
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
		<div className="my-32">
			<Title applicationType={applicationType} />
			<div className="flex justify-center">{children}</div>
		</div>
	) : (
		<ApplyConfirm applicationURL={applicationURL} role={applicationType} />
	);
	return (
		<div className="flex flex-col items-center justify-center gap-10 min-h-screen">
			<Image
				src={clouds}
				alt="Background clouds"
				className="absolute top-0 min-w-[1500px] xl:min-w-[100vw] xl:w-[100vw] z-[-1] h-[200vh]"
			/>
			{!applicationsOpened || deadlinePassed ? (
				<ApplicationsClosed />
			) : (
				applyBody
			)}
		</div>
	);
}
