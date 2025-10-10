import { useContext, useState } from "react";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { Review, submitReview } from "@/lib/admin/useApplicant";
import { Uid } from "@/lib/userRecord";
import UserContext from "@/lib/admin/UserContext";
import { isReviewer } from "@/lib/admin/authorization";
import Container from "@cloudscape-design/components/container";

interface ColoredTextBoxProps {
	text: string | undefined;
}

const ColoredTextBox = ({ text }: ColoredTextBoxProps) => {
	return (
		<Box variant="span" color="text-status-error" fontWeight="heavy">
			{text}
		</Box>
	);
};

interface ApplicantActionsProps {
	applicant: Uid;
	reviews: Review[];
	score: number;
	submitReview: submitReview;
}

function ZotHacksHackerApplicantActions({
	applicant,
	reviews,
	score,
	submitReview,
}: ApplicantActionsProps) {
	const { uid, roles } = useContext(UserContext);

	const uniqueReviewers = Array.from(
		new Set(reviews.map((review) => review[1])),
	);

	// const canReview = either there are less than 2 reviewers or uid is in current reviews
	const canReview = uid
		? uniqueReviewers.length < 2 || uniqueReviewers.includes(uid)
		: false;

	if (!isReviewer(roles)) {
		return null;
	}

	const handleClick = () => {
		// TODO: use flashbar or modal for submit status
		submitReview(applicant, score);
	};

	return canReview ? (
		<SpaceBetween direction="horizontal" size="xs">
			<SpaceBetween direction="horizontal" size="xs">
				{score === -2 && (
					<>
						<Box variant="h3" color="text-status-error">
							OVERQUALIFIED
						</Box>
						<Box variant="h3">|</Box>
					</>
				)}
				<Box variant="h3" color="text-status-warning">
					Calculated score: {score}
				</Box>
			</SpaceBetween>

			<Button onClick={handleClick} disabled={!canReview}>
				Submit
			</Button>
		</SpaceBetween>
	) : (
		<SpaceBetween size="xxs">
			<Box variant="awsui-key-label" color="text-status-info">
				<ColoredTextBox text={uniqueReviewers[0].split(".").at(-1)} /> and{" "}
				<ColoredTextBox text={uniqueReviewers[1].split(".").at(-1)} /> already
				submitted reviews.
			</Box>
			<Box variant="awsui-key-label" color="text-status-info">
				Contact a Logistics or Tech director if you think this is an error.
			</Box>
		</SpaceBetween>
	);
}

export default ZotHacksHackerApplicantActions;
