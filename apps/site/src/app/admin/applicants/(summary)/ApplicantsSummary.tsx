"use client";

import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import ApplicationsByRoleChart from "./ApplicationsByRoleChart";
import ApplicationsBySchoolChart from "./ApplicationsBySchoolChart";

function ApplicantsSummary() {
	return (
		<ContentLayout
			defaultPadding
			header={<Header variant="h1">Applicants</Header>}
		>
			<SpaceBetween size="l">
				<Container
					header={
						<Header
							variant="h2"
							description="Daily applications submitted by school"
						>
							Applications Submitted
						</Header>
					}
				>
					<ApplicationsBySchoolChart />
				</Container>
				<Container
					header={
						<Header
							variant="h2"
							description="Cumulative daily applications submitted by role"
						>
							Cumulative Applications Submitted
						</Header>
					}
				>
					<ApplicationsByRoleChart />
				</Container>
			</SpaceBetween>
		</ContentLayout>
	);
}

export default ApplicantsSummary;
