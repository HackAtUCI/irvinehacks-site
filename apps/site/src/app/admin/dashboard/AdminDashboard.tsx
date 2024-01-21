"use client";

import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import SpaceBetween from "@cloudscape-design/components/space-between";

import ApplicantSummary from "./components/ApplicantSummary";

function AdminDashboard() {
	return (
		<ContentLayout>
			<SpaceBetween size="l">
				<Container>Admin Dashboard</Container>
				<ApplicantSummary />
			</SpaceBetween>
		</ContentLayout>
	);
}

export default AdminDashboard;
