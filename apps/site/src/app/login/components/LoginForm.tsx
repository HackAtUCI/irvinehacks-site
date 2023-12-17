"use client";

import { FormEvent, useState } from "react";

import RequiredAsterisk from "@/app/apply/sections/Components/RequiredAsterisk";
import Button from "@/lib/components/Button/Button";

const EMAIL_REGEX = /^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/;
const LOGIN_PATH = "/api/user/login";

function LoginForm() {
	const [validated, setValidated] = useState<boolean | null>(null);

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		const form = event.currentTarget;
		if (!form.checkValidity()) {
			// prevent submission to display validation feedback
			event.preventDefault();
			setValidated(false);
		} else {
			setValidated(true);
		}
	};

	return (
		<form
			noValidate
			method="post"
			action={LOGIN_PATH}
			onSubmit={handleSubmit}
			className="bg-white p-10 rounded-2xl mx-5 text-black"
		>
			<div className="flex flex-col mb-5">
				<label htmlFor="email">
					Email <RequiredAsterisk />
				</label>
				<input
					id="email"
					type="email"
					className="bg-[#e1e1e1] p-1 peer rounded-2"
					pattern={EMAIL_REGEX.source}
					name="email"
					placeholder="Enter email"
					aria-describedby="email-description"
					required
				/>
				<small id="email-description">
					UCI students will log in with UCI SSO. Please make sure to
					use your school email address if you have one.
				</small>
				{validated === false ? (
					<p className="feedback invalid text-red-500 peer">
						Sorry, that email address is invalid.
					</p>
				) : null}
			</div>
			<Button text="Continue" />
		</form>
	);
}

export default LoginForm;
