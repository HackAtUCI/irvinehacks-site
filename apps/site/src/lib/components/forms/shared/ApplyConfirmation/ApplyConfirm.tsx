import getUserIdentity from "@/lib/utils/getUserIdentity";
import ConfirmationDetails from "./ConfirmationDetails";

interface ApplyConfirmProps {
	applicationURL: string;
	isHacker: boolean;
	role: "Hacker" | "Mentor" | "Volunteer";
}

export default async function ApplyConfirm({
	applicationURL,
	isHacker,
	role
}: ApplyConfirmProps) {
	const identity = await getUserIdentity();
	const roleText = isHacker
		? "In addition, I understand that I must check in at certain times on all three event days in order to be eligible to win prizes."
		: "In addition, I understand that I must show up for my scheduled shifts.";
	return (
		<div className="flex items-center py-16 px-10 min-w-screen min-h-screen">
			<ConfirmationDetails
				applicationURL={applicationURL}
				role={role}
				roleText={roleText}
				isLoggedIn={identity.uid !== null}
			/>
		</div>
	);
}
