import { useContext, useState } from "react";

import ButtonDropdown, {
	ButtonDropdownProps,
} from "@cloudscape-design/components/button-dropdown";

import { Decision, submitHackerReview, Uid } from "@/lib/admin/useApplicant";
import UserContext from "@/lib/admin/UserContext";
import { isReviewer } from "@/lib/admin/authorization";
import { Button, Input, SpaceBetween } from "@cloudscape-design/components";

interface ApplicantActionsProps {
	applicant: Uid;
	submitHackerReview: submitHackerReview;
}

interface ReviewButtonItem extends ButtonDropdownProps.Item {
	id: Decision;
}

type ReviewButtonItems = ReviewButtonItem[];

function HackerApplicantActions({
	applicant,
	submitHackerReview,
}: ApplicantActionsProps) {
	const { roles } = useContext(UserContext);
	const [value, setValue] = useState("");

	if (!isReviewer(roles)) {
		return null;
	}

	// const handleClick = (
	// 	event: CustomEvent<ButtonDropdownProps.ItemClickDetails>,
	// ) => {
	// 	const review = event.detail.id;
	// 	submitHackerReview(applicant, review as Decision);
	// };

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
			<Button onClick={() => submitHackerReview(applicant, value)}>
				Submit
			</Button>
		</SpaceBetween>
	);
}

export default HackerApplicantActions;
