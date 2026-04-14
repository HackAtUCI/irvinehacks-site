import { useContext } from "react";

import ButtonDropdown, {
	ButtonDropdownProps,
} from "@cloudscape-design/components/button-dropdown";

import { isDirector, isReviewer } from "@/lib/admin/authorization";
import { submitReview, voidApplicant, unvoidApplicant } from "@/lib/admin/useApplicant";
import UserContext from "@/lib/admin/UserContext";
import { Decision, Uid } from "@/lib/userRecord";
import { decisionsToScores } from "@/lib/decisionScores";

interface ApplicantActionsProps {
	applicant: Uid;
	submitReview: submitReview;
	voidApplicant: voidApplicant;
	unvoidApplicant: unvoidApplicant;
	isVoided?: boolean;
}

interface ReviewButtonItem extends ButtonDropdownProps.Item {
	id: Decision | "VOID" | "UNVOID";
}

type ReviewButtonItems = ReviewButtonItem[];

function ApplicantActions({
	applicant,
	submitReview,
	voidApplicant,
	unvoidApplicant,
	isVoided,
}: ApplicantActionsProps) {
	const { roles } = useContext(UserContext);

	if (!isReviewer(roles) && !isDirector(roles)) {
		return null;
	}

	const handleClick = (
		event: CustomEvent<ButtonDropdownProps.ItemClickDetails>,
	) => {
		if (event.detail.id === "VOID") {
			voidApplicant(applicant);
			return;
		}
		if (event.detail.id === "UNVOID") {
			unvoidApplicant(applicant);
			return;
		}
		const review = event.detail.id as Decision;
		submitReview(applicant, decisionsToScores[review]);
	};

	const dropdownItems: ReviewButtonItems = [
		{
			text: "Accept",
			id: Decision.Accepted,
			iconName: "status-positive",
			description: "Accept the applicant",
		},
		{
			text: "Waitlist",
			id: Decision.Waitlisted,
			iconName: "status-pending",
			description: "Waitlist the applicant",
		},
		{
			text: "Reject",
			id: Decision.Rejected,
			iconName: "status-negative",
			description: "Reject the applicant",
		},
	];

	if (isDirector(roles)) {
		if (isVoided) {
			dropdownItems.push({
				text: "Unvoid",
				id: "UNVOID",
				iconName: "status-pending",
				description: "Unvoid the applicant — return to review queue",
			});
		} else {
			dropdownItems.push({
				text: "Void",
				id: "VOID",
				iconName: "status-stopped",
				description: "Void the applicant — no longer under consideration",
			});
		}
	}

	return (
		<ButtonDropdown items={dropdownItems} onItemClick={handleClick}>
			Review
		</ButtonDropdown>
	);
}

export default ApplicantActions;
