import getUserIdentity from "@/lib/utils/getUserIdentity";
import ConfirmationDetails from "./ConfirmationDetails";

export default async function ApplyConfirm() {
	const identity = await getUserIdentity();
	return (
		<div className="flex items-center w-screen h-screen">
			<ConfirmationDetails isLoggedIn={identity.uid !== null} />
		</div>
	);
}
