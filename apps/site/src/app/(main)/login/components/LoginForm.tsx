import clsx from "clsx";

import ValidatingForm from "@/lib/components/ValidatingForm/ValidatingForm";
import RequiredAsterisk from "@/lib/components/forms/RequiredAsterisk";

import Graphic from "@/assets/images/login-page-graphic.png";

import Image from "next/image";

import loginFormStyles from "./LoginForm.module.scss";
import styles from "@/lib/components/ValidatingForm/ValidatingForm.module.scss";

// eslint-disable-next-line no-useless-escape
const EMAIL_REGEX = /^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/;
const LOGIN_PATH = "/api/user/login";

function LoginForm({ return_to }: { return_to?: string }) {
	const searchParams = new URLSearchParams();

	if (return_to !== undefined) {
		searchParams.append("return_to", return_to);
	}

	return (
		<div className="relative mx-8 md:m-0 p-6 md:px-10 md:py-8 border-[5px] border-[var(--color-yellow)] text-[var(--color-yellow)] bg-[#000] lg:w-[75%] w-[90%]">
			<Image
				src={Graphic}
				alt="login page graphic"
				className={loginFormStyles.loginFormGraphic}
			/>
			<ValidatingForm method="post" action={LOGIN_PATH + `?${searchParams}`}>
				<div className="flex flex-col mb-12 gap-2 w-full mt-8">
					<label htmlFor="email">
						Email <RequiredAsterisk />
					</label>
					<input
						id="email"
						type="email"
						className="bg-[#FFF] text-[var(--color-black)] p-1 rounded-2 lg:h-12 md:h-10 "
						pattern={EMAIL_REGEX.source}
						name="email"
						placeholder="Enter email"
						aria-describedby="email-description"
						required
					/>
					<p className={clsx(styles.invalidFeedback, "text-red-500")}>
						Sorry, that email address is invalid.
					</p>
				</div>
			</ValidatingForm>
		</div>
	);
}

export default LoginForm;
