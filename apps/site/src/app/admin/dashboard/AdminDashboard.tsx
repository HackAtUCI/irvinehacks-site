"use client";

import { useContext } from "react";

import ContentLayout from "@cloudscape-design/components/content-layout";
import SpaceBetween from "@cloudscape-design/components/space-between";
import ExpandableSection from "@cloudscape-design/components/expandable-section";

import { isApplicationManager } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";

import ApplicantSummary from "./components/ApplicantSummary";
import ApplicantTable from "./components/ApplicantTable";
import HackerCount from "./components/HackerCount";
import ReviewerSummary from "./components/ReviewerSummary";

function AdminDashboard() {
	const { roles } = useContext(UserContext);

	return (
		<ContentLayout>
			<SpaceBetween size="l">
				<HackerCount />
				{isApplicationManager(roles) && <ApplicantSummary />}
				{isApplicationManager(roles) && (
					<ExpandableSection headerText="Applicant Table" defaultExpanded>
						<ApplicantTable />
					</ExpandableSection>
				)}

				{isApplicationManager(roles) && (
					<ExpandableSection headerText="Reviewer Summary" defaultExpanded>
						<ReviewerSummary />
					</ExpandableSection>
				)}
			</SpaceBetween>
		</ContentLayout>
	);
}

export default AdminDashboard;
