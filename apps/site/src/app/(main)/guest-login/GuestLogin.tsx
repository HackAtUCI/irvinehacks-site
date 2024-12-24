import Image from "next/image";
import { redirect } from "next/navigation";

import GuestLoginVerificationForm from "./components/GuestLoginVerificationForm";
import getUserIdentity from "@/lib/utils/getUserIdentity";

import clouds from "@/assets/images/starry_clouds.png";

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
			<Image
				src={clouds}
				alt="Background clouds"
				className="absolute top-0 min-w-[1500px] xl:min-w-[100vw] xl:w-[100vw] z-[-1] h-[200vh]"
			/>
			<h1 className="font-display text-3xl md:text-5xl mb-20">
				Enter Passphrase
			</h1>
			<GuestLoginVerificationForm />
		</div>
	);
}

export default GuestLogin;
