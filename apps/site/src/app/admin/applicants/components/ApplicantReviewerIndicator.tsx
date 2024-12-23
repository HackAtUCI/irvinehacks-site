import {
	Box,
	SpaceBetween,
	StatusIndicator,
} from "@cloudscape-design/components";

interface IndicatorContainerProps {
	reviewerNumber: string;
	type: string;
}

const IndicatorContainer = ({
	reviewerNumber,
	type,
}: IndicatorContainerProps) => {
	return (
		<>
			<Box variant="awsui-key-label">Reviewer {reviewerNumber}</Box>
			{type === "notReviewed" ? (
				<StatusIndicator type="error">Not Reviewed</StatusIndicator>
			) : (
				<StatusIndicator>Reviewed</StatusIndicator>
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
			{num_reviewers === 0 ? (
				<>
					<IndicatorContainer reviewerNumber="1" type="notReviewed" />
					<IndicatorContainer reviewerNumber="2" type="notReviewed" />
				</>
			) : num_reviewers === 1 ? (
				<>
					<IndicatorContainer reviewerNumber="1" type="reviewed" />
					<IndicatorContainer reviewerNumber="2" type="notReviewed" />
				</>
			) : num_reviewers === 2 ? (
				<>
					<IndicatorContainer reviewerNumber="1" type="reviewed" />
					<IndicatorContainer reviewerNumber="2" type="reviewed" />
				</>
			) : (
				<></>
			)}
		</SpaceBetween>
	);
}

export default ApplicantReviewerIndicator;
