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
				className="text-color-red"
				style={{ width: "100%" }}
				text={buttonText}
			/>
		</form>
	);
}
