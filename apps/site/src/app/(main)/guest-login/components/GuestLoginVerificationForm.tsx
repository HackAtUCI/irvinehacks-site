"use client";

import { useSearchParams } from "next/navigation";
import clsx from "clsx";

import ValidatingForm from "@/lib/components/ValidatingForm/ValidatingForm";
import RequiredAsterisk from "@/lib/components/forms/RequiredAsterisk";

import styles from "@/lib/components/ValidatingForm/ValidatingForm.module.scss";

const VERIFICATION_PATH = "/api/guest/verify";
const PASSPHRASE_REGEX = /\w+-\w+-\w+-\w+/;

export default function GuestLoginVerificationForm() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email");

	if (!email) {
		return <p>Error: email was not provided</p>;
	}

	return (
		<div className="mx-8 md:m-0 p-6 md:px-10 md:py-8 border-[2px] md:border-[5px] border-[var(--color-white)] text-[var(--color-white)] bg-[var(--color-black)]">
			<ValidatingForm method="post" action={VERIFICATION_PATH}>
				<div className="flex flex-col mb-12 gap-2">
					<input type="email" name="email" value={email} readOnly hidden />
					<label htmlFor="passphrase">
						Passphrase <RequiredAsterisk />
					</label>
					<input
						id="passphrase"
						className="bg-[#e1e1e1] p-1 rounded-2 text-black placeholder-gray-500"
						type="text"
						pattern={PASSPHRASE_REGEX.source}
						required
						name="passphrase"
						placeholder="Enter passphrase"
						aria-describedby="passphrase-description"
					/>
					<small id="passphrase-description">
						A login passphrase was sent to your email. Please enter the
						passphrase.
					</small>
					<span className="text-[#FF2222]">
						If you cannot find the passphrase, please check your spam.
					</span>
					<p className={clsx(styles.invalidFeedback, "text-red-500")}>
						Sorry, that passphrase is invalid.
					</p>
				</div>
			</ValidatingForm>
		</div>
	);
}
