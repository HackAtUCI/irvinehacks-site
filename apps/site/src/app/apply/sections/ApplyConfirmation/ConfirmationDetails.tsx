import Button from "@/lib/components/Button/Button";
import styles from "./ConfirmationDetails.module.scss";

export default function ConfirmationDetails() {
	return (
		<div
			className={`${styles.details} w-8/12 flex flex-col items-center p-12 gap-10 z-1 max-[800px]:w-9/12 max-[400px]:w-11/12`}
		>
			<h2 className={`${styles.header} text-5xl`}>Before Applying</h2>
			<p className={`${styles.policy} text-lg`}>
				By submitting an application for Hack at UCI 2023, I understand
				that Hack at UCI will take place in person during the day from
				February 3rd to 5th, and that Hack at UCI will not be providing
				transportation or overnight accommodations. In addition, I
				understand that I must check in at certain times on all three
				event days in order to be eligible to win prizes. Lastly, I
				acknowledge that I am currently a student enrolled in an
				accredited college or university in the United States and will
				be over the age of 18 by February 3rd, 2023.
			</p>
			<Button text="Proceed to Application" href="/apply?prefaceAccepted=true" />
		</div>
	);
}
