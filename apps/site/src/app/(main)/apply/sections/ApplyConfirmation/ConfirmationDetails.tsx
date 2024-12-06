import Button from "@/lib/components/Button/Button";

interface ConfirmationDetailsProps {
	isLoggedIn: boolean;
}

export default async function ConfirmationDetails({
	isLoggedIn,
}: ConfirmationDetailsProps) {
	return (
		<div className="flex flex-col items-center gap-8 mx-20 p-6 md:px-10 md:py-8 border-[2px] md:border-[5px] border-[var(--color-white)] text-[var(--color-white)] bg-[var(--color-black)]">
			<h1 className="text-5xl">Before Applying</h1>
			<p className="text-lg">
				By submitting an application for IrvineHacks 2024, I understand that
				IrvineHacks will take place in person during the day from January 26 to
				28, and that IrvineHacks will not be providing transportation or
				overnight accommodations. In addition, I understand that I must check in
				at certain times on all three event days in order to be eligible to win
				prizes. Lastly, I acknowledge that I am currently a student enrolled in
				an accredited high school, college, or university in the United States
				and will be over the age of 18 by January 26th, 2024.
			</p>
			<strong className="text-lg text-[#FF2222]">
				Applications are due on January 14th, 2024 at 11:59PM PST.
			</strong>
			<Button
				text={isLoggedIn ? "Proceed to Application" : "Log in to Apply"}
				href={isLoggedIn ? "/apply?prefaceAccepted=true" : "/login"}
			/>
			<hr className="mt-5 w-full h-0.5 bg-[#432810]" />
			<p className="text-display">
				Interested in helping out instead? Consider applying to be a{" "}
				<a className="underline" href="/mentor">
					mentor
				</a>{" "}
				or a{" "}
				<a className="underline" href="/volunteer">
					volunteer
				</a>
				.
			</p>
		</div>
	);
}
