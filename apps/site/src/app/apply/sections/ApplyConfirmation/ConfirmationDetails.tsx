import Button from "@/lib/components/Button/Button";
import styles from "./ConfirmationDetails.module.scss";
import Link from "next/link";

interface ConfirmationDetailsProps {
	isLoggedIn: boolean;
}

export default async function ConfirmationDetails({
	isLoggedIn,
}: ConfirmationDetailsProps) {
	return (
		<div
			className={`${styles.details} w-8/12 flex flex-col items-center p-12 gap-10 z-1 max-[800px]:w-9/12 max-[400px]:w-11/12`}
		>
			<h1 className={`${styles.header} text-5xl`}>Before Applying</h1>
			<p className={`${styles.policy} text-lg`}>
				By submitting an application for IrvineHacks 2024, I understand
				that IrvineHacks will take place in person during the day from
				January 26 to 28, and that IrvineHacks will not be providing
				transportation or overnight accommodations. In addition, I
				understand that I must check in at certain times on all three
				event days in order to be eligible to win prizes. Lastly, I
				acknowledge that I am currently a student enrolled in an
				accredited college or university in the United States and will
				be over the age of 18 by January 26th, 2024.
			</p>
			<strong className="text-lg text-[#FF2222]">
				Applications are due on January 14th, 2024 at 11:59PM PST.
			</strong>
			<Button
				text={isLoggedIn ? "Proceed to Application" : "Log in to apply"}
				href={isLoggedIn ? "/apply?prefaceAccepted=true" : "/login"}
			/>
			<hr className="mt-5" />
			<p className="text-display">
				Interested in helping out instead? Consider applying to be a{" "}
				<Link className="underline" href="/mentor">
					mentor
				</Link>{" "}
				or a{" "}
				<Link className="underline" href="/volunteer">
					volunteer
				</Link>
				.
			</p>
		</div>
	);
}
