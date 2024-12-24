import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

interface IndicatorContainerProps {
	number: number;
	hasReviewed: boolean;
}

const IndicatorContainer = ({
	number,
	hasReviewed,
}: IndicatorContainerProps) => {
	return (
		<>
			<Box variant="awsui-key-label">Reviewer {number}</Box>
			{hasReviewed ? (
				<StatusIndicator>Reviewed</StatusIndicator>
			) : (
				<StatusIndicator type="pending">Not Reviewed</StatusIndicator>
			)}
		</>
	);
};

interface ApplicantReviewerIndicatorProps {
	num_reviewers: number;
}

function ApplicantReviewerIndicator({
	num_reviewers,
}: ApplicantReviewerIndicatorProps) {
	return (
		<SpaceBetween size="l">
			{[1, 2].map((n) => (
				<IndicatorContainer
					key={n}
					number={n}
					hasReviewed={num_reviewers >= n}
				/>
			))}
		</SpaceBetween>
	);
}

export default ApplicantReviewerIndicator;
