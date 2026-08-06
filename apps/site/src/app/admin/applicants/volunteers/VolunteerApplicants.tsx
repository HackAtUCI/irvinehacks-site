"use client";

import { useRouter } from "next/navigation";

import { useContext, useState } from "react";

import Box from "@cloudscape-design/components/box";
import Cards from "@cloudscape-design/components/cards";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { useFollowWithNextLink } from "@/app/admin/layout/common";
import useMentorVolunteerApplicants, {
	ApplicantSummary,
} from "@/lib/admin/useMentorVolunteerApplicants";

import ApplicantFilters, {
	Options,
} from "@/app/admin/applicants/components/ApplicantFilters";
import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";
import AutoDecisionBadge from "@/app/admin/applicants/components/AutoDecisionBadge";

import UserContext from "@/lib/admin/UserContext";
import { isVolunteerReviewer } from "@/lib/admin/authorization";
import { ParticipantRole } from "@/lib/userRecord";

function VolunteerApplicants() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isVolunteerReviewer(roles)) {
		router.push("/admin/dashboard");
	}

	const [selectedStatuses, setSelectedStatuses] = useState<Options>([]);
	const [selectedDecisions, setSelectedDecisions] = useState<Options>([]);
	const { applicantList, loading } = useMentorVolunteerApplicants("volunteers");

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
					applicantType={ParticipantRole.Volunteer}
				/>
			}
			empty={emptyContent}
			header={<Header counter={counter}>Volunteer Applicants</Header>}
		/>
	);
}

const CardHeader = ({
	_id,
	first_name,
	last_name,
	decision,
	auto_decision_reason,
}: ApplicantSummary) => {
	const followWithNextLink = useFollowWithNextLink();
	return (
		<SpaceBetween direction="horizontal" size="s">
			<Link
				href={`/admin/applicants/volunteers/${_id}`}
				fontSize="inherit"
				onFollow={followWithNextLink}
			>
				{first_name} {last_name}
			</Link>
			<AutoDecisionBadge reason={auto_decision_reason} decision={decision} />
		</SpaceBetween>
	);
};

const DecisionStatus = ({ decision }: ApplicantSummary) =>
	decision ? <ApplicantStatus status={decision} /> : "-";

export default VolunteerApplicants;
