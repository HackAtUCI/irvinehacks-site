"use client";

import { useSearchParams } from "next/navigation";
import clsx from "clsx";

import ValidatingForm from "@/lib/components/ValidatingForm/ValidatingForm";
import styles from "@/lib/components/ValidatingForm/ValidatingForm.module.scss";

const VERIFICATION_PATH = "/api/guest/verify";
const PASSPHRASE_REGEX = /\w+-\w+-\w+-\w+/;

function VerificationForm() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email");

	if (!email) {
		return <p>Error: email was not provided</p>;
	}

	return (
		<div className="bg-white p-5 md:p-10 rounded-2xl mx-5 text-black">
			<ValidatingForm method="post" action={VERIFICATION_PATH}>
				<div className="flex flex-col mb-5">
					<input
						type="email"
						name="email"
						value={email}
						readOnly
						hidden
					/>
					<label htmlFor="passphrase">Passphrase</label>
					<input
						id="passphrase"
						className="bg-[#e1e1e1] p-1 rounded-2"
						type="text"
						pattern={PASSPHRASE_REGEX.source}
						required
						name="passphrase"
						placeholder="Enter passphrase"
						aria-describedby="passphrase-description"
					/>
					<small id="passphrase-description">
						A login passphrase was sent to your email. Please enter
						the passphrase.
					</small>
					<p className={clsx(styles.invalidFeedback, "text-red-500")}>
						Sorry, that passphrase is invalid.
					</p>
				</div>
			</ValidatingForm>
		</div>
	);
}

export default VerificationForm;
