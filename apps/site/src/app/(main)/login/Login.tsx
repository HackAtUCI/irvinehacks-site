import { redirect } from "next/navigation";
import getUserIdentity from "@/lib/utils/getUserIdentity";
import LoginForm from "./components/LoginForm";

async function Login({
	searchParams,
}: {
	searchParams?: {
		application?: string;
	};
}) {
	console.log(searchParams);
	const identity = await getUserIdentity();
	if (identity.uid !== null) {
		if (searchParams === undefined || searchParams.application === undefined) {
			redirect("/portal");
		}
		redirect(`/portal?application=${searchParams.application}`);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<h1 className="font-display text-3xl md:text-5xl mb-20">
				Login to Portal
			</h1>
			<LoginForm />
		</div>
	);
}

export default Login;
