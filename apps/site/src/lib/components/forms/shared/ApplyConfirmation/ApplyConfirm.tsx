import Image from "next/image";

import getUserIdentity from "@/lib/utils/getUserIdentity";
import ConfirmationDetails from "./ConfirmationDetails";

import cityBackground from "@/assets/backgrounds/alt_illus_moonless.png";

interface ApplyConfirmProps {
	applicationURL: "/apply" | "/mentor" | "/volunteer";
	role: "Hacker" | "Mentor" | "Volunteer";
}

const hackerClause =
	"In addition, I understand that I must check in at certain times on all three event days in order to be eligible to win prizes. Lastly, I acknowledge that I am currently a student enrolled in an accredited high school, college, or university in the United States and will be over the age of 18 by February 27th, 2026.";

const mentorDetails =
	"- Mentors will be expected to provide support for hackers upon request.\n- Mentors will be scheduled for specific time slots, which will be formally assigned on event day.\n- Mentors will attend a mandatory orientation prior to the event, which will be formally scheduled near event day.\n- Mentors will have access to free workshops, social events, food, swag, and opportunities to network with students and sponsors.";
const volunteerDetails =
	"- Volunteers will be scheduled for specific time slots.\n- Volunteers will assist the organizers with running the event.\n- There will also be a mandatory volunteer orientation before the hackathon. If you are unable to attend, you must watch the recording that will be sent out.";

export default async function ApplyConfirm({
	applicationURL,
	role,
}: ApplyConfirmProps) {
	const identity = await getUserIdentity();

	const roleText = role === "Hacker" ? hackerClause : "";

	const appDescription =
		role === "Mentor"
			? mentorDetails
			: role === "Volunteer"
			  ? volunteerDetails // eslint-disable-line
			  : ""; // eslint-disable-line

	return (
		<div className="flex items-center pt-24 pb-16">
			<Image
				src={cityBackground}
				alt="Background image"
				quality={100}
				fill
				sizes="100vh"
				style={{ objectFit: "cover", zIndex: -1 }} // cover ensures it covers the area and z-index places it behind content
				priority
			/>
			<ConfirmationDetails
				isLoggedIn={identity.uid !== null}
				applicationURL={applicationURL}
				role={role}
				roleText={roleText}
				appDescription={appDescription}
			/>
		</div>
	);
}
