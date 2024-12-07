import { redirect } from "next/navigation";

import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import haveApplicationsOpened from "@/lib/utils/haveApplicationsOpened";

import ApplyConfirm from "../apply/sections/ApplyConfirmation/ApplyConfirm";
import Form from "./Form/Form";
import Title from "../apply/sections/Title/Title";
import getUserIdentity from "@/lib/utils/getUserIdentity";

import ApplicationsClosed from "../apply/sections/ApplicationsClosed/ApplicationsClosed";

export const revalidate = 60;

export default async function Apply({
	searchParams,
}: {
	searchParams?: {
		prefaceAccepted?: string;
	};
}) {
	const hasAcceptedQueryParam = searchParams?.prefaceAccepted === "true";
	const identity = await getUserIdentity();

	// if (identity.status !== null) {
	// 	redirect("/portal");
	// }

	// if (hasAcceptedQueryParam && identity.uid === null) {
	// 	redirect("/login");
	// }

	const deadlinePassed = hasDeadlinePassed();
	const applicationsOpened = haveApplicationsOpened();
	const applyBody = hasAcceptedQueryParam ? (
		<>
			<Title applicationType="Mentor" />
			<div className="flex justify-center">
				<Form />
			</div>
		</>
	) : (
		<ApplyConfirm continueHREF="/mentor" isHacker={false} />
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
