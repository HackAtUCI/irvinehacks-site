import Image from "next/image";
import { redirect } from "next/navigation";
import dayjs from "dayjs";

import ApplyConfirm from "./sections/ApplyConfirmation/ApplyConfirm";
import Form from "./sections/Form/Form";
import Title from "./sections/Title/Title";
import getUserIdentity from "@/lib/utils/getUserIdentity";

import koiLeft from "@/assets/images/koi-swim-left.png";
import koiRight from "@/assets/images/koi-swim-right.png";

import styles from "./Apply.module.scss";
import ApplicationsClosed from "./sections/ApplicationsClosed/ApplicationsClosed";

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

	if (identity.status !== null) {
		redirect("/portal");
	}

	if (hasAcceptedQueryParam && identity.uid === null) {
		redirect("/login");
	}

	const deadlineSeconds = 1705305540;
	const deadlinePassed = dayjs().unix() > deadlineSeconds;

	const applyBody = hasAcceptedQueryParam ? (
		<>
			<Title />
			<div className="relative w-full flex flex-col items-center">
				<Image
					src={koiLeft}
					height="250"
					alt="Koi fish"
					className={`${styles.image} absolute top-0 right-0`}
				/>
				<Image
					src={koiRight}
					height="250"
					alt="Koi fish"
					className={`${styles.image} absolute top-1/4 left-0`}
				/>
				<Image
					src={koiLeft}
					height="250"
					alt="Koi fish"
					className={`${styles.image} absolute top-1/2 right-0`}
				/>
				<Image
					src={koiRight}
					height="250"
					alt="Koi fish"
					className={`${styles.image} absolute top-3/4 left-0`}
				/>
				<Form />
			</div>
		</>
	) : (
		<ApplyConfirm />
	);
	return (
		<div className="flex flex-col items-center gap-10 my-32 min-h-[calc(100vh-8rem)]">
			{deadlinePassed ? <ApplicationsClosed /> : applyBody}
		</div>
	);
}
