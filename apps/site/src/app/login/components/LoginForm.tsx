import clsx from "clsx";

import Button from "@/lib/components/Button/Button";
import ValidatingForm from "@/lib/components/ValidatingForm/ValidatingForm";
import styles from "@/lib/components/ValidatingForm/ValidatingForm.module.scss";

const EMAIL_REGEX = /^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/;
const LOGIN_PATH = "/api/user/login";

function LoginForm() {
	return (
		<ValidatingForm method="post" action={LOGIN_PATH}>
			<div className="bg-white p-5 md:p-10 rounded-2xl mx-5 text-black">
				<div className="flex flex-col mb-5">
					<label htmlFor="email">Email</label>
					<input
						id="email"
						type="email"
						className="bg-[#e1e1e1] p-1 rounded-2"
						pattern={EMAIL_REGEX.source}
						name="email"
						placeholder="Enter email"
						aria-describedby="email-description"
						required
					/>
					<small id="email-description">
						UCI students will log in with UCI SSO. Please make sure
						to use your school email address if you have one.
					</small>
					<p className={clsx(styles.invalidated, "text-red-500")}>
						Sorry, that email address is invalid.
					</p>
				</div>
				<Button text="Continue" />
			</div>
		</ValidatingForm>
	);
}

export default LoginForm;
