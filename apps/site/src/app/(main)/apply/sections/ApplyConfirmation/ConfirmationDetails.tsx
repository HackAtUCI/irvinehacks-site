import Button from "@/lib/components/Button/Button";

interface ConfirmationDetailsProps {
	isLoggedIn: boolean;
	continueHREF: string;
	roleText: string;
}

export default async function ConfirmationDetails({
	isLoggedIn,
	continueHREF,
	roleText,
}: ConfirmationDetailsProps) {
	return (
		<div className="flex flex-col items-center gap-8 p-10 md:p-6 md:px-10 md:py-8 border-[2px] md:border-[5px] border-[var(--color-white)] text-[var(--color-white)] bg-[var(--color-black)]">
			<h1 className="text-5xl">Before Applying</h1>
			<p className="text-lg">
				By submitting an application for IrvineHacks 2024, I understand that
				IrvineHacks will take place in person during the day from January 26 to
				28, and that IrvineHacks will not be providing transportation or
				overnight accommodations. {roleText} Lastly, I acknowledge that I am
				currently a student enrolled in an accredited high school, college, or
				university in the United States and will be over the age of 18 by
				January 26th, 2024.
			</p>
			<strong className="text-lg text-[#FF2222]">
				Applications are due on January 14th, 2024 at 11:59PM PST.
			</strong>
			<Button
				className="text-2xl"
				text={isLoggedIn ? "Proceed to Application" : "Log in to Apply"}
				href={isLoggedIn ? `${continueHREF}?prefaceAccepted=true` : "/login"}
				isLightVersion
			/>
		</div>
	);
}
