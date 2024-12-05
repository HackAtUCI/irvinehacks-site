import { redirect } from "next/navigation";

import GuestLoginVerificationForm from "./components/GuestLoginVerificationForm";
import getUserIdentity from "@/lib/utils/getUserIdentity";
import water from "@/assets/backgrounds/water.jpg";

async function GuestLogin() {
	const identity = await getUserIdentity();
	if (identity.uid !== null) redirect("/portal");

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center"
			style={{ backgroundImage: `url("${water.src}")` }}
		>
			<h1 className="font-display text-3xl md:text-5xl mb-20">
				Enter Passphrase
			</h1>
			<GuestLoginVerificationForm />
		</div>
	);
}

export default GuestLogin;
