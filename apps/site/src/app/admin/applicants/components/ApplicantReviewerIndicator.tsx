import { Uid } from "@/lib/userRecord";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

interface IndicatorContainerProps {
	displayNumber: number;
	reviewer: string | undefined;
}

const IndicatorContainer = ({
	displayNumber,
	reviewer,
}: IndicatorContainerProps) => {
	return (
		<>
			<Box variant="awsui-key-label">
				Reviewer {displayNumber}: {reviewer}
			</Box>
			{reviewer ? (
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
	const formatUid = (uid: Uid) => uid.split(".").at(-1);

	return (
		<SpaceBetween size="l">
			{[0, 1].map((n) => (
				<IndicatorContainer
					key={n}
					displayNumber={n + 1}
					reviewer={reviewers[n] ? formatUid(reviewers[n]) : ""}
				/>
			))}
		</SpaceBetween>
	);
}

export default ApplicantReviewerIndicator;
