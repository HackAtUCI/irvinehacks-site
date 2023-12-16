"use client";

import { useSearchParams } from "next/navigation";

import ValidatingForm from "@/lib/components/ValidatingForm/ValidatingForm";

const VERIFICATION_PATH = "/api/guest/verify";
const PASSPHRASE_REGEX = /\w+-\w+-\w+-\w+/;

function VerificationForm() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email");

	if (!email) {
		return <p>Error: email was not provided</p>;
	}

	return (
		<ValidatingForm method="post" action={VERIFICATION_PATH}>
			<input type="email" name="email" value={email} readOnly hidden />
			<div>
				<label>Passphrase</label>
				<input
					type="text"
					pattern={PASSPHRASE_REGEX.source}
					required
					name="passphrase"
					placeholder="Enter passphrase"
				/>
				<p className="feedback invalid">
					Sorry, that passphrase is invalid.
				</p>
			</div>
			<button type="submit">Continue</button>
		</ValidatingForm>
	);
}

export default VerificationForm;
