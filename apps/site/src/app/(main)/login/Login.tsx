import Image from "next/image";
import { redirect } from "next/navigation";
import getUserIdentity from "@/lib/utils/getUserIdentity";
import LoginForm from "./components/LoginForm";
import clouds from "@/assets/images/starry_clouds.png";

async function Login({
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
				className="absolute top-0 w-[100vw] h-[200vh] z-[-1]"
			/>
			<h1 className="font-display text-3xl md:text-5xl mb-20">
				Login to Portal
			</h1>
			<LoginForm return_to={searchParams?.return_to} />
		</div>
	);
}

export default Login;
