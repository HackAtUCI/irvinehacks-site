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
		if (searchParams?.return_to === undefined) {
			redirect("/portal");
		} else if (searchParams.return_to === "/portal") {
			redirect(searchParams.return_to);
		}
		redirect(`/portal?return_to=${searchParams.return_to}`);
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
