"use client";

import { useRouter } from "next/navigation";

import { useContext, useState } from "react";

import Box from "@cloudscape-design/components/box";
import Cards from "@cloudscape-design/components/cards";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";

import { useFollowWithNextLink } from "@/app/admin/layout/common";
import useMentorVolunteerApplicants, {
	ApplicantSummary,
} from "@/lib/admin/useMentorVolunteerApplicants";

import ApplicantFilters, {
	Options,
} from "@/app/admin/applicants/components/ApplicantFilters";
import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";

import UserContext from "@/lib/admin/UserContext";
import { isVolunteerReviewer } from "@/lib/admin/authorization";
import { ParticipantRole, Status } from "@/lib/userRecord";

function VolunteerApplicants() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isVolunteerReviewer(roles)) {
		router.push("/admin/dashboard");
	}

	const [selectedStatuses, setSelectedStatuses] = useState<Options>([]);
	const [selectedDecisions, setSelectedDecisions] = useState<Options>([]);
	const { applicantList, loading } = useMentorVolunteerApplicants("volunteers");

	const selectedStatusValues = new Set(
		selectedStatuses.map(({ value }) => value),
	);
	const selectedDecisionValues = new Set(
		selectedDecisions.map(({ value }) => value),
	);

	const voidedSelected = selectedDecisionValues.has("VOIDED");
	const nonVoidedDecisions = new Set(
		[...selectedDecisionValues].filter((v) => v !== "VOIDED"),
	);

	const filteredApplicants = applicantList.filter((applicant) => {
		const matchesStatus =
			selectedStatuses.length === 0 ||
			selectedStatusValues.has(applicant.status);

		let matchesDecision: boolean;
		if (selectedDecisions.length === 0) {
			matchesDecision = true;
		} else if (applicant.is_voided) {
			matchesDecision = voidedSelected;
		} else {
			matchesDecision =
				nonVoidedDecisions.size > 0 &&
				nonVoidedDecisions.has(applicant.decision || "-");
		}

		return matchesStatus && matchesDecision;
	});

	const items = filteredApplicants;

	const activeApplicants = applicantList.filter((a) => !a.is_voided);

	const counter =
		selectedStatuses.length > 0 || selectedDecisions.length > 0
			? `(${items.length}/${activeApplicants.length})`
			: `(${activeApplicants.length})`;

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
						content: StatusWithVoided,
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

const CardHeader = ({ _id, first_name, last_name }: ApplicantSummary) => {
	const followWithNextLink = useFollowWithNextLink();
	return (
		<Link
			href={`/admin/applicants/volunteers/${_id}`}
			fontSize="inherit"
			onFollow={followWithNextLink}
		>
			{first_name} {last_name}
		</Link>
	);
};

const StatusWithVoided = ({ status, is_voided }: ApplicantSummary) => (
	<ApplicantStatus status={status} isVoided={is_voided} />
);

const DecisionStatus = ({ decision, is_voided }: ApplicantSummary) =>
	is_voided ? (
		<ApplicantStatus status={decision ?? Status.Pending} isVoided />
	) : decision ? (
		<ApplicantStatus status={decision} />
	) : (
		"-"
	);

export default VolunteerApplicants;
