import { redirect } from "next/navigation";
import getUserIdentity from "@/lib/utils/getUserIdentity";
import LoginForm from "./components/LoginForm";
import LoginBackground from "@/assets/backgrounds/login-background.png";
import Image from "next/image";

async function Login({
	searchParams,
}: {
	searchParams: {
		return_to?: string;
	};
}) {
	const { return_to } = searchParams;

	const identity = await getUserIdentity();
	if (identity.uid !== null) {
		redirect(return_to ?? "/portal");
	}

	return (
		<div className="bg-[#00001c]">
			<div className="min-h-screen absolute overflow-hidden z-10 w-full flex flex-col items-center justify-center">
				<h1 className="font-heading text-yellow mb-20 [text-shadow:0_0_25px_#E5F200] text-4xl md:text-5xl lg:text-7xl">
					Log In
				</h1>
				<LoginForm return_to={return_to} />
			</div>
			<div className="min-h-screen w-full">
				<Image
					src={LoginBackground}
					alt="login background"
					fill
					className="object-cover"
				/>
			</div>
		</div>
	);
}

export default Login;
