import { redirect } from "next/navigation";
import getUserIdentity from "@/lib/utils/getUserIdentity";
import LoginForm from "./components/LoginForm";

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
		<div className="min-h-screen flex flex-col items-center justify-center">
			<h1 className="font-display text-3xl md:text-5xl mb-20">Log In</h1>
			<LoginForm return_to={return_to} />
		</div>
	);
}

export default Login;
