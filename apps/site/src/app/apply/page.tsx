import Image from "next/image";

import koiLeft from "@/assets/images/koi-swim-left.png";
import koiRight from "@/assets/images/koi-swim-right.png";

import ApplyConfirm from "./sections/ApplyConfirmation/ApplyConfirm";
import Form from "./sections/Form/Form";
import Title from "./sections/Title/Title";

import styles from "./Apply.module.scss";

export const revalidate = 60;

export default function Apply({
	searchParams,
}: {
	searchParams?: {
		prefaceAccepted?: string;
	};
}) {
	const applyBody =
		searchParams !== undefined &&
		searchParams?.prefaceAccepted === "true" ? (
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
			{applyBody}
		</div>
	);
}
