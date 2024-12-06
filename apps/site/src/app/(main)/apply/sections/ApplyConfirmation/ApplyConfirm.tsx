import getUserIdentity from "@/lib/utils/getUserIdentity";
import ConfirmationDetails from "./ConfirmationDetails";

interface ApplyConfirmInterface {
	continueHREF: string;
	isNotHacker: boolean;
}

export default async function ApplyConfirm({
	continueHREF,
	isNotHacker,
}: ApplyConfirmInterface) {
	const identity = await getUserIdentity();
	const roleText = isNotHacker
		? "In addition, I understand that I must show up for my scheduled shifts."
		: "In addition, I understand that I must check in at certain times on all three event days in order to be eligible to win prizes.";

	return (
		<div className="flex items-center w-screen h-screen">
			<ConfirmationDetails
				continueHREF={continueHREF}
				roleText={roleText}
				isLoggedIn={identity.uid !== null}
			/>
		</div>
	);
}
