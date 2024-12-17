"use client";

import { useRouter } from "next/navigation";

import { useContext, useState } from "react";

import Box from "@cloudscape-design/components/box";
import Cards from "@cloudscape-design/components/cards";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";

import { useFollowWithNextLink } from "@/app/admin/layout/common";
import useApplicants, { ApplicantSummary } from "@/lib/admin/useApplicants";

import ApplicantFilters, { Options } from "./components/ApplicantFilters";
import ApplicantStatus from "./components/ApplicantStatus";

import UserContext from "@/lib/admin/UserContext";
import { isApplicationManager } from "@/lib/admin/authorization";

function Applicants() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isApplicationManager(roles)) {
		router.push("/admin/dashboard");
	}

	const [selectedStatuses, setSelectedStatuses] = useState<Options>([]);
	const [selectedDecisions, setSelectedDecisions] = useState<Options>([]);
	const { applicantList, loading } = useApplicants();

	const selectedStatusValues = selectedStatuses.map(({ value }) => value);
	const selectedDecisionValues = selectedDecisions.map(({ value }) => value);

	const filteredApplicants = applicantList.filter(
		(applicant) =>
			(selectedStatuses.length === 0 ||
				selectedStatusValues.includes(applicant.status)) &&
			(selectedDecisions.length === 0 ||
				selectedDecisionValues.includes(applicant.decision || "-")),
	);

	const items = filteredApplicants;

	const counter =
		selectedStatuses.length > 0 || selectedDecisions.length > 0
			? `(${items.length}/${applicantList.length})`
			: `(${applicantList.length})`;

	const emptyContent = (
		<Box textAlign="center" color="inherit">
			No applicants
		</Box>
	);

	return (
		<Cards
			cardDefinition={{
				header: CardHeader,
				sections: [
					{
						id: "uid",
						header: "UID",
						content: ({ _id }) => _id,
					},
					{
						id: "school",
						header: "School",
						content: ({ application_data }) => application_data.school,
					},
					{
						id: "status",
						header: "Status",
						content: ApplicantStatus,
					},
					{
						id: "submission_time",
						header: "Applied",
						content: ({ application_data }) =>
							new Date(application_data.submission_time).toLocaleDateString(),
					},
					{
						id: "decision",
						header: "Decision",
						content: DecisionStatus,
					},
				],
			}}
			// visibleSections={preferences.visibleContent}
			loading={loading}
			loadingText="Loading applicants"
			items={items}
			trackBy="_id"
			variant="full-page"
			filter={
				<ApplicantFilters
					selectedStatuses={selectedStatuses}
					setSelectedStatuses={setSelectedStatuses}
					selectedDecisions={selectedDecisions}
					setSelectedDecisions={setSelectedDecisions}
				/>
			}
			empty={emptyContent}
			header={<Header counter={counter}>Applicants</Header>}
		/>
	);
}

const CardHeader = ({ _id, first_name, last_name }: ApplicantSummary) => {
	const followWithNextLink = useFollowWithNextLink();
	return (
		<Link
			href={`/admin/applicants/${_id}`}
			fontSize="inherit"
			onFollow={followWithNextLink}
		>
			{first_name} {last_name}
		</Link>
	);
};

const DecisionStatus = ({ decision }: ApplicantSummary) =>
	decision ? <ApplicantStatus status={decision} /> : "-";

export default Applicants;
