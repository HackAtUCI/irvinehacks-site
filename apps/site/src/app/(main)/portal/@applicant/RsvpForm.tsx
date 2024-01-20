"use client";

import Button from "@/lib/components/Button/Button";

interface RsvpFormProps {
	buttonText: string;
	showMessage: boolean;
}

export default function RsvpForm({ buttonText, showMessage }: RsvpFormProps) {
	const confirmationMessage =
		"WARNING: You will not be able to RSVP again. Are you sure you want to continue?";

	return (
		<form
			method="post"
			action="/api/user/rsvp"
			onSubmit={(event) => {
				if (showMessage && !confirm(confirmationMessage)) {
					event.preventDefault();
				}
			}}
		>
			<Button className="text-color-red" text={buttonText} />
		</form>
	);
}
