import { redirect } from "next/navigation";
import getUserIdentity from "@/lib/utils/getUserIdentity";
import LoginForm from "./components/LoginForm";

async function Login({
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
		}
		redirect(`/portal?return_to=${searchParams.return_to}`);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<h1 className="font-display text-3xl md:text-5xl mb-20">
				Login to Portal
			</h1>
			<LoginForm return_to={searchParams?.return_to} />
		</div>
	);
}

export default Login;
