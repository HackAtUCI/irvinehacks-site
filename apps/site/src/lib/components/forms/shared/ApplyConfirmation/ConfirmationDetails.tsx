import Button from "@/lib/components/Button/Button";
import Link from "next/link";

interface ConfirmationDetailsProps {
	isLoggedIn: boolean;
	applicationURL: string;
	appDescription?: string;
	roleText: string;
	role: "Hacker" | "Mentor" | "Volunteer";
}

export default async function ConfirmationDetails({
	isLoggedIn,
	applicationURL,
	appDescription,
	roleText,
	role,
}: ConfirmationDetailsProps) {
	const otherRoles = ["Hacker", "Mentor", "Volunteer"].filter(
		(r) => r !== role,
	);
	return (
		<div className="flex flex-col items-center gap-8 px-4 py-6 mx-4 max-w-screen-lg md:p-6 md:px-10 md:py-8 border-[2px] md:border-[5px] border-[var(--color-white)] text-[var(--color-white)] bg-[var(--color-black)]">
			<h1 className="text-5xl text-center">Before Applying</h1>
			{role === "Volunteer" && (
				<>
					<p className="text-lg m-0 w-full">
						Interested in volunteering during IrvineHacks 2026? Please fill in
						the application below, and we hope you can join our event team!
						<br />
						<br />
						What: Volunteering at UCI's Annual Hackathon
						<br />
						When: February 27 2026 - March 1st 2026 (3-day weekend event - not
						overnight)
						<br />
						Where: UC Irvine Student Center, Pacific Ballroom
					</p>
					<p className="text-lg m-0 w-full">
						<b>
							As a volunteer, you’ll play a key role in ensuring the event runs
							smoothly, and you’ll also get some great perks, including:
						</b>
						<br />
						- Free food and swag
						<br />
						- Opportunities to network with fellow students, industry mentors,
						and sponsors
						<br />- A chance to be part of one of the largest tech events at UCI
						and in Orange County
					</p>
				</>
			)}
			{appDescription && (
				<>
					<div>
						<b className="text-lg m-0 w-full">
							Details About the{" "}
							<strong className="text-[#FBA80A]">{role}</strong> Role:
						</b>

						{appDescription.split("\n").map((line, index) => (
							<p key={index} className="text-lg m-0 w-full">
								{line}
							</p>
						))}
					</div>
					<p className="text-lg m-0 w-full">
						<span className="text-[#FF2222]">IMPORTANT NOTE:</span> Please
						ensure you are fully available before applying. This role does not
						include travel reimbursements, and we cannot provide visa support,
						sponsorship, or official letters.
					</p>

					<hr className="mt-5 w-full h-0.5 bg-[#432810]" />
				</>
			)}
			{role === "Mentor" ? (
				<p className="text-lg">
					By submitting an application for IrvineHacks 2026 as a{" "}
					<strong className="text-[#FBA80A]">{role}</strong>, I understand that
					IrvineHacks will take place in person during the day from February 27
					to March 1, and that IrvineHacks will not be providing transportation
					or overnight accommodations. In addition, I understand that I must
					show up for my scheduled shifts. Lastly, I acknowledge that I will be
					over the age of 18 by February 27th, 2026.
				</p>
			) : role === "Hacker" ? (
				<p className="text-lg">
					By submitting an application for IrvineHacks 2026 as a{" "}
					<strong className="text-[#FBA80A]">{role}</strong>, I understand that
					IrvineHacks will take place in person during the day from February 27
					to March 1, and that IrvineHacks will not be providing transportation
					or overnight accommodations. {roleText}
				</p>
			) : (
				""
			)}
			<strong className="text-lg text-[#FF2222]">
				Applications are due on February 11th, 2026 at 11:59PM PST.
			</strong>
			<Button
				className="text-2xl"
				text={isLoggedIn ? "Proceed to Application" : "Log in to Apply"}
				href={
					isLoggedIn
						? `${applicationURL}?prefaceAccepted=true`
						: `/login?${new URLSearchParams({ return_to: applicationURL })}`
				}
				isLightVersion
			/>

			<p>
				Interested in being a{" "}
				{otherRoles.map((role, index) => (
					<span key={role}>
						<Link
							href={role === "Hacker" ? `/apply` : `/${role.toLowerCase()}`}
							className="text-[#FBA80A] underline"
						>
							{role}
						</Link>
						{index < otherRoles.length - 1 ? " or " : " "}
					</span>
				))}
				instead?
			</p>
		</div>
	);
}
