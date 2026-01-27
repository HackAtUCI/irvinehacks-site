import { useContext } from "react";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { Review } from "@/lib/admin/useApplicant";
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

const WEIGHTING_CONFIG: Record<string, [number, number]> = {
	frq_change: [20, 0.2],
	frq_ambition: [20, 0.25],
	frq_character: [20, 0.2],
	previous_experience: [1, 0.3],
	has_socials: [1, 0.05],
};

interface ApplicantActionsProps {
	applicant: Uid;
	reviews: Review[];
	scores: object;
	notes?: string;
	onSubmitDetailedReview: (
		uid: Uid,
		scores: object,
		notes: string | null,
	) => void;
}

function HackerApplicantActions({
	applicant,
	reviews,
	scores,
	notes,
	onSubmitDetailedReview,
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
		onSubmitDetailedReview(applicant, scores, notes ?? null);
	};

	const calculateTotalScore = (scores: Record<string, number>) => {
		if (scores.resume === -1000) {
			return -1000;
		}

		// Detect if we are using IrvineHacks scoring by the presence of its specific fields
		const isIrvineHacks = "has_socials" in scores || "frq_change" in scores;

		if (isIrvineHacks) {
			let weightedSum = 0;
			for (const [field, [maxScore, weight]] of Object.entries(
				WEIGHTING_CONFIG,
			)) {
				const score = scores[field] ?? 0;
				// In case of any leftover -1 values (though typically filtered out)
				const normalizedScore = score === -1 ? 0 : score;
				weightedSum += (normalizedScore / maxScore) * weight;
			}

			let totalScore = weightedSum * 100;
			return Math.max(totalScore, -3);
		}

		// Fallback to simple sum for ZotHacks
		// TOOD: Make this configurable by specifying weight config
		const totalScore = Object.values(scores).reduce(
			(acc, val) => acc + (val === -1 ? 0 : val),
			0,
		);
		return Math.max(totalScore, -3);
	};

	const totalScore = calculateTotalScore(scores as Record<string, number>);

	return canReview ? (
		<SpaceBetween direction="horizontal" size="xs">
			<SpaceBetween direction="horizontal" size="xs">
				{totalScore <= -1000 && (
					<>
						<Box variant="h3" color="text-status-error">
							OVERQUALIFIED
						</Box>
						<Box variant="h3">|</Box>
					</>
				)}
				<Box variant="h3" color="text-status-warning">
					Calculated score: {totalScore.toFixed(2)}
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

export default HackerApplicantActions;
