import clsx from "clsx";

import ValidatingForm from "@/lib/components/ValidatingForm/ValidatingForm";
import styles from "@/lib/components/ValidatingForm/ValidatingForm.module.scss";
import RequiredAsterisk from "@/lib/components/forms/RequiredAsterisk";

// eslint-disable-next-line no-useless-escape
const EMAIL_REGEX = /^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/;
const LOGIN_PATH = "/api/user/login";

function LoginForm() {
	return (
		<div className="mx-8 md:m-0 p-6 md:px-10 md:py-8 border-[2px] md:border-[5px] border-[var(--color-white)] text-[var(--color-white)] bg-[var(--color-black)]">
			<ValidatingForm method="post" action={LOGIN_PATH}>
				<div className="flex flex-col mb-12 gap-2">
					<label htmlFor="email">
						Email <RequiredAsterisk />
					</label>
					<input
						id="email"
						type="email"
						className="bg-[#e1e1e1] text-[var(--color-black)] p-1 rounded-2"
						pattern={EMAIL_REGEX.source}
						name="email"
						placeholder="Enter email"
						aria-describedby="email-description"
						required
					/>
					<small id="email-description">
						UCI students will log in with UCI SSO. Please make sure to use your
						school email address if you have one.
					</small>
					<p className={clsx(styles.invalidFeedback, "text-red-500")}>
						Sorry, that email address is invalid.
					</p>
				</div>
			</ValidatingForm>
		</div>
	);
}

export default LoginForm;
