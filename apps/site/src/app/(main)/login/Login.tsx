import getUserIdentity from "@/lib/utils/getUserIdentity";
import LoginForm from "./components/LoginForm";

import water from "@/assets/backgrounds/water.jpg";
import { redirect } from "next/navigation";

async function Login() {
	const identity = await getUserIdentity();
	if (identity.uid !== null) redirect("/portal");

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center"
			style={{ backgroundImage: `url("${water.src}")` }}
		>
			<h1 className="font-display text-5xl md:text-7xl mb-10">
				Login to Portal
			</h1>
			<LoginForm />
		</div>
	);
}

export default Login;