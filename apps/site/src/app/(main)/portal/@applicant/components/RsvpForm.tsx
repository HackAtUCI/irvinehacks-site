"use client";

import Button from "@/lib/components/Button/Button";

interface RsvpFormProps {
	buttonText: string;
	showWarning: boolean;
}

export default function RsvpForm({ buttonText, showWarning }: RsvpFormProps) {
	const confirmationMessage =
		"WARNING: You will not be able to RSVP again. Are you sure you want to continue?";

	return (
		<form
			method="post"
			action="/api/user/rsvp"
			onSubmit={(event) => {
				if (showWarning && !confirm(confirmationMessage)) {
					event.preventDefault();
				}
			}}
		>
			<Button
				text={buttonText}
				isLightVersion={true}
				className="text-xs sm:text-base md:text-4xl !bg-pink"
			/>
		</form>
	);
}
