import { useContext, useState } from "react";

import { Button, Input, SpaceBetween } from "@cloudscape-design/components";
import { submitReview } from "@/app/admin/applicants/hackers/useApplicant";
import { Uid } from "@/lib/userRecord";
import UserContext from "@/lib/admin/UserContext";
import { isReviewer } from "@/lib/admin/authorization";

interface ApplicantActionsProps {
	applicant: Uid;
	submitReview: submitReview;
}

function HackerApplicantActions({
	applicant,
	submitReview,
}: ApplicantActionsProps) {
	const { roles } = useContext(UserContext);
	const [value, setValue] = useState("");

	if (!isReviewer(roles)) {
		return null;
	}

	return (
		<SpaceBetween direction="horizontal" size="xs">
			<Input
				onChange={({ detail }) => setValue(detail.value)}
				value={value}
				type="number"
				inputMode="decimal"
				placeholder="Applicant score"
				step={0.5}
			/>
			<Button
				onClick={() => {
					submitReview(applicant, value);
					setValue("");
				}}
			>
				Submit
			</Button>
		</SpaceBetween>
	);
}

export default HackerApplicantActions;
