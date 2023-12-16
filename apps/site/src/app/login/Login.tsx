import LoginForm from "./components/LoginForm";

function Login() {
	// TODO: check if user is already authenticated

	return (
		<div className="min-h-screen flex flex-col justify-center bg-white text-black">
			<h1>Log In</h1>
			<LoginForm />
		</div>
	);
}

export default Login;
