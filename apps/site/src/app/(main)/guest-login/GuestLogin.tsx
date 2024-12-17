import { redirect } from "next/navigation";

import GuestLoginVerificationForm from "./components/GuestLoginVerificationForm";
import getUserIdentity from "@/lib/utils/getUserIdentity";

async function GuestLogin({
	searchParams,
}: {
	searchParams?: {
		return_to?: string;
	};
}) {
	const identity = await getUserIdentity();
	if (identity.uid !== null) {
		redirect(searchParams?.return_to ?? "/portal");
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<h1 className="font-display text-3xl md:text-5xl mb-20">
				Enter Passphrase
			</h1>
			<GuestLoginVerificationForm />
		</div>
	);
}

export default GuestLogin;
