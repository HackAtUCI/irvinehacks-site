import getUserIdentity from "@/lib/utils/getUserIdentity";
import ConfirmationDetails from "./ConfirmationDetails";

export default async function ApplyConfirm() {
	const identity = await getUserIdentity();
	return (
		<div className="flex flex-col items-center gap-10">
			<ConfirmationDetails isLoggedIn={identity.uid !== null} />
		</div>
	);
}
