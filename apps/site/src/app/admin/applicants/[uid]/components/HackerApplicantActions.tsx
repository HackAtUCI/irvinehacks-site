import { useContext, useState } from "react";

import { Button, Input, SpaceBetween } from "@cloudscape-design/components";
import { submitHackerReview, Uid } from "@/lib/admin/useApplicant";
import UserContext from "@/lib/admin/UserContext";
import { isReviewer } from "@/lib/admin/authorization";

interface ApplicantActionsProps {
	applicant: Uid;
	submitHackerReview: submitHackerReview;
}

function HackerApplicantActions({
	applicant,
	submitHackerReview,
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
				step={0.1}
			/>
			<Button
				onClick={() => {
					submitHackerReview(applicant, value);
					setValue("");
				}}
			>
				Submit
			</Button>
		</SpaceBetween>
	);
}

export default HackerApplicantActions;
