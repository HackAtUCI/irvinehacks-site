import getUserIdentity from "@/lib/utils/getUserIdentity";
import ConfirmationDetails from "./ConfirmationDetails";

interface ApplyConfirmProps {
	applicationURL: "/apply" | "/mentor" | "/volunteer";
	applicationType: "Hacker" | "Mentor" | "Volunteer";
}

export default async function ApplyConfirm({
	applicationURL,
	applicationType,
}: ApplyConfirmProps) {
	const identity = await getUserIdentity();

	const roleText =
		applicationType === "Hacker"
			? "In addition, I understand that I must check in at certain times on all three event days in order to be eligible to win prizes. Lastly, I acknowledge that I am currently a student enrolled in an accredited high school, college, or university in the United States and will be over the age of 18 by January 24th, 2025."
			: "In addition, I understand that I must show up for my scheduled shifts. Lastly, I acknowledge that I will be over the age of 18 by January 24th, 2025.";

	const appDescription =
		applicationType === "Mentor"
			? "Details About the Mentor Role:\n- Mentors will be expected to provide support for hackers upon request.\n- Mentors will be scheduled for specific time slots, which will be formally assigned towards event day.\n- Mentors will attend a mandatory orientation prior to the event, which will be formally scheduled towards event day.\n- Mentors will have access to everything else at the hackathon - free workshops, socials, food, swag, and opportunities to network with students and sponsors."
			: applicationType === "Volunteer"
			  ? "Details About the Volunteer Role:\n- Volunteers will assist the organizers with running the event.\n- Volunteers will be scheduled for specific time slots, which will be formally assigned towards event day.\n- Volunteers will attend a mandatory orientation prior to the event, which will be formally scheduled towards event day.\n- Volunteers will be given food and swag." // eslint-disable-line
			  : ""; // eslint-disable-line

	return (
		<div className="flex items-center py-16">
			<ConfirmationDetails
				isLoggedIn={identity.uid !== null}
				applicationURL={applicationURL}
				roleText={roleText}
				appDescription={appDescription}
			/>
		</div>
	);
}
