import VerificationForm from "./components/VerificationForm";

function GuestLogin() {
	return (
		<div className="min-h-screen flex flex-col justify-center bg-white text-black">
			<h1>Log In</h1>
			<p>
				A login passphrase was sent to your email. Please enter the passphrase.
			</p>
			<VerificationForm />
		</div>
	);
}

export default GuestLogin;
