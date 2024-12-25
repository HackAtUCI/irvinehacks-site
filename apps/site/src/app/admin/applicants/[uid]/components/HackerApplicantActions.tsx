import { useContext, useState } from "react";

import {
	Box,
	Button,
	Input,
	SpaceBetween,
} from "@cloudscape-design/components";
import {
	Review,
	submitReview,
} from "@/app/admin/applicants/hackers/useApplicant";
import { Uid } from "@/lib/userRecord";
import UserContext from "@/lib/admin/UserContext";
import { isReviewer } from "@/lib/admin/authorization";

interface ApplicantActionsProps {
	applicant: Uid;
	reviews: Review[];
	submitReview: submitReview;
}

function HackerApplicantActions({
	applicant,
	reviews,
	submitReview,
}: ApplicantActionsProps) {
	const { uid, roles } = useContext(UserContext);
	const [value, setValue] = useState("");
	// const canReview = either there are less than 2 reviewers or uid is in current reviews
	const uniqueReviewers = new Set(reviews.map((review) => review[1]));
	const canReview = uid
		? uniqueReviewers.size < 2 || uniqueReviewers.has(uid)
		: false;

	if (!isReviewer(roles)) {
		return null;
	}

	return canReview ? (
		<SpaceBetween direction="horizontal" size="xs">
			<Input
				onChange={({ detail }) => setValue(detail.value)}
				value={value}
				type="number"
				inputMode="decimal"
				placeholder="Applicant score"
				step={0.5}
				disabled={!canReview}
			/>
			<Button
				onClick={() => {
					submitReview(applicant, value);
					setValue("");
				}}
				disabled={!canReview}
			>
				Submit
			</Button>
		</SpaceBetween>
	) : (
		<Box variant="awsui-key-label" color="text-status-warning">
			Two reviewers have already submitted reviews. Log in as one of them to
			submit a review.
		</Box>
	);
}

export default HackerApplicantActions;
