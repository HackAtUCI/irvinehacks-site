import { useContext } from "react";

import ButtonDropdown, {
	ButtonDropdownProps,
} from "@cloudscape-design/components/button-dropdown";

import { isReviewer } from "@/lib/admin/authorization";
import { submitReview } from "@/lib/admin/useApplicant";
import UserContext from "@/lib/admin/UserContext";
import { Decision, Uid } from "@/lib/userRecord";
import { decisionsToScores } from "@/lib/decisionScores";

interface ApplicantActionsProps {
	applicant: Uid;
	submitReview: submitReview;
}

interface ReviewButtonItem extends ButtonDropdownProps.Item {
	id: Decision;
}

type ReviewButtonItems = ReviewButtonItem[];

function ApplicantActions({ applicant, submitReview }: ApplicantActionsProps) {
	const { roles } = useContext(UserContext);

	if (!isReviewer(roles)) {
		return null;
	}

	const handleClick = (
		event: CustomEvent<ButtonDropdownProps.ItemClickDetails>,
	) => {
		const review = event.detail.id as Decision;
		submitReview(applicant, decisionsToScores[review]);
	};

	const dropdownItems: ReviewButtonItems = [
		{
			text: "Accept",
			id: Decision.accepted,
			iconName: "status-positive",
			description: "Accept the applicant",
		},
		{
			text: "Waitlist",
			id: Decision.waitlisted,
			iconName: "status-pending",
			description: "Waitlist the applicant",
		},
		{
			text: "Reject",
			id: Decision.rejected,
			iconName: "status-negative",
			description: "Reject the applicant",
		},
	];

	return (
		<ButtonDropdown items={dropdownItems} onItemClick={handleClick}>
			Review
		</ButtonDropdown>
	);
}

export default ApplicantActions;
