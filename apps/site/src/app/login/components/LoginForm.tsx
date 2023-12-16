import ValidatingForm from "@/lib/components/ValidatingForm/ValidatingForm";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const LOGIN_PATH = "/api/user/login";

function LoginForm() {
	return (
		<ValidatingForm method="post" action={LOGIN_PATH}>
			<div>
				<label>Email address</label>
				<input
					type="email"
					pattern={EMAIL_REGEX.source}
					required
					name="email"
					placeholder="Enter email"
					aria-describedby="email-description"
				/>
				<div className="feedback invalid">
					Sorry, that email address is invalid.
				</div>
				<p id="email-description" className="muted">
					UCI students will log in with UCI SSO. Please make sure to
					use your school email address if you have one.
				</p>
			</div>
			<button type="submit">Continue</button>
		</ValidatingForm>
	);
}

export default LoginForm;
