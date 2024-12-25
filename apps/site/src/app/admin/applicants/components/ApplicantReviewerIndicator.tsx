import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

interface IndicatorContainerProps {
	displayNumber: number;
	reviewer: string;
	hasReviewed: boolean;
}

const IndicatorContainer = ({
	displayNumber,
	reviewer,
	hasReviewed,
}: IndicatorContainerProps) => {
	return (
		<>
			<Box variant="awsui-key-label">
				Reviewer {displayNumber}: {reviewer}
			</Box>
			{hasReviewed ? (
				<StatusIndicator>Reviewed</StatusIndicator>
			) : (
				<StatusIndicator type="pending">Not Reviewed</StatusIndicator>
			)}
		</>
	);
};

interface ApplicantReviewerIndicatorProps {
	reviewers: ReadonlyArray<string>;
}

function ApplicantReviewerIndicator({
	reviewers,
}: ApplicantReviewerIndicatorProps) {
	return (
		<SpaceBetween size="l">
			{[0, 1].map((n) => (
				<IndicatorContainer
					key={n}
					displayNumber={n + 1}
					reviewer={reviewers[n] ? reviewers[n] : ""}
					hasReviewed={reviewers.length >= n + 1}
				/>
			))}
		</SpaceBetween>
	);
}

export default ApplicantReviewerIndicator;
