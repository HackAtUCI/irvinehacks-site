import { useContext } from "react";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { Review, submitDetailedReview } from "@/lib/admin/useApplicant";
import { Uid } from "@/lib/userRecord";
import UserContext from "@/lib/admin/UserContext";
import { isReviewer } from "@/lib/admin/authorization";

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
	scores: object;
	notes?: string;
	submitDetailedReview: submitDetailedReview;
}

function ZotHacksHackerApplicantActions({
	applicant,
	reviews,
	scores,
	notes,
	submitDetailedReview,
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
		submitDetailedReview(applicant, scores, notes ? notes.trim() : null);
	};

	const totalScore = Object.values(scores).reduce(
		(acc, currentValue) => acc + currentValue,
		0,
	);

	return canReview ? (
		<SpaceBetween direction="horizontal" size="xs">
			<SpaceBetween direction="horizontal" size="xs">
				{totalScore < 0 && (
					<>
						<Box variant="h3" color="text-status-error">
							OVERQUALIFIED
						</Box>
						<Box variant="h3">|</Box>
					</>
				)}
				<Box variant="h3" color="text-status-warning">
					Calculated score: {totalScore}
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
