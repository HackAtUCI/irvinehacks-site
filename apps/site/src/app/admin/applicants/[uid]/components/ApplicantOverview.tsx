import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";

import { ApplicantStatus } from "admin/components";
import { Applicant } from "admin/utils/useApplicant";

import ApplicationReviews from "./ApplicationReviews";

interface ApplicantOverviewProps {
	applicant: Applicant;
}

function ApplicantOverview({ applicant }: ApplicantOverviewProps) {
	const { application_data, status } = applicant;
	const { submission_time, reviews } = application_data;

	const submittedDate = new Date(submission_time).toDateString();

	return (
		<Container header={<Header variant="h2">Overview</Header>}>
			<ColumnLayout columns={3} variant="text-grid">
				<div>
					<Box variant="awsui-key-label">Submitted</Box>
					{submittedDate}
				</div>
				<div>
					<Box variant="awsui-key-label">Status</Box>
					<ApplicantStatus status={status} />
				</div>
				<div>
					<Box variant="awsui-key-label">Reviews</Box>
					<ApplicationReviews reviews={reviews} />
				</div>
			</ColumnLayout>
		</Container>
	);
}

export default ApplicantOverview;
