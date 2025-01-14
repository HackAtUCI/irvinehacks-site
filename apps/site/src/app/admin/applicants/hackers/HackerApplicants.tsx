"use client";

import { useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import Box from "@cloudscape-design/components/box";
import Cards from "@cloudscape-design/components/cards";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import { ParticipantRole } from "@/lib/userRecord";

import { useFollowWithNextLink } from "@/app/admin/layout/common";
import useHackerApplicants, {
	HackerApplicantSummary,
} from "@/lib/admin/useHackerApplicants";

import ApplicantFilters, {
	Options,
} from "@/app/admin/applicants/components/ApplicantFilters";
import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";

import UserContext from "@/lib/admin/UserContext";
import { isHackerReviewer } from "@/lib/admin/authorization";
import HackerThresholdInputs from "../components/HackerThresholdInputs";
import ApplicantReviewerIndicator from "../components/ApplicantReviewerIndicator";

import useHackerThresholds from "@/lib/admin/useHackerThresholds";

function HackerApplicants() {
	const router = useRouter();
	const { roles } = useContext(UserContext);

	if (!isHackerReviewer(roles)) {
		router.push("/admin/dashboard");
	}

	const [selectedStatuses, setSelectedStatuses] = useState<Options>([]);
	const [selectedDecisions, setSelectedDecisions] = useState<Options>([]);
	const [uciNetIDFilter, setUCINetIDFilter] = useState<Options>([]);

	const { applicantList, loading } = useHackerApplicants();

	const selectedStatusValues = selectedStatuses.map(({ value }) => value);
	const selectedDecisionValues = selectedDecisions.map(({ value }) => value);
	const uciNetIDFilterValues = uciNetIDFilter.map(({ value }) => value);

	const [acceptedCount, setAcceptedCount] = useState(0);
	const [waitlistedCount, setWaitlistedCount] = useState(0);
	const [rejectedCount, setRejectCount] = useState(0);

	const { thresholds } = useHackerThresholds();
	const acceptThreshold = thresholds?.accept;
	const waitlistThreshold = thresholds?.waitlist;

	const filteredApplicants = applicantList.filter((applicant) => {
		return (
			(selectedStatuses.length === 0 ||
				selectedStatusValues.includes(applicant.status)) &&
			(selectedDecisions.length === 0 ||
				selectedDecisionValues.includes(applicant.decision || "-")) &&
			(uciNetIDFilter.length === 0 ||
				applicant.reviewers.some((reviewer) =>
					uciNetIDFilterValues.includes(reviewer),
				))
		);
	});

	useEffect(() => {
		const accepted = acceptThreshold ? acceptThreshold : 0;
		const waitlisted = waitlistThreshold ? waitlistThreshold : 0;

		const acceptedCount = applicantList.filter(
			(applicant) => applicant.avg_score >= accepted,
		).length;
		setAcceptedCount(acceptedCount);

		const waitlistedCount = applicantList.filter(
			(applicant) =>
				applicant.avg_score >= waitlisted && applicant.avg_score < accepted,
		).length;
		setWaitlistedCount(waitlistedCount);

		const rejectedCount = applicantList.filter(
			(applicant) => applicant.avg_score < waitlisted,
		).length;
		setRejectCount(rejectedCount);
	}, [applicantList, acceptThreshold, waitlistThreshold]);

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
						id: "reviewers",
						header: "",
						content: ApplicantReviewerIndicator,
					},
					{
						id: "submission_time",
						header: "Applied",
						content: ({ application_data }) =>
							new Date(application_data.submission_time).toLocaleDateString(),
					},
					{
						id: "avg_score",
						header: "Averaged Score",
						content: ({ avg_score }) => (avg_score === -1 ? "-" : avg_score),
					},
					{
						id: "decision",
						header: "Decision",
						content: DecisionStatus,
					},
				],
			}}
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
					uciNetIDFilter={uciNetIDFilter}
					setUCINetIDFilter={setUCINetIDFilter}
					applicantType={ParticipantRole.Hacker}
				/>
			}
			empty={emptyContent}
			header={
				<Header actions={<HackerThresholdInputs />}>
					Hacker Applicants {counter}
					<div
						style={{ fontSize: "0.875rem", color: "#5f6b7a", marginTop: "4px" }}
					>
						{acceptedCount} applicants with &quot;accepted&quot; status
					</div>
					<div
						style={{ fontSize: "0.875rem", color: "#5f6b7a", marginTop: "4px" }}
					>
						{waitlistedCount} applicants with &quot;waitlisted&quot; status
					</div>
					<div
						style={{ fontSize: "0.875rem", color: "#5f6b7a", marginTop: "4px" }}
					>
						{rejectedCount} applicants with &quot;rejected&quot; status
					</div>
				</Header>
			}
		/>
	);
}

const CardHeader = ({ _id, first_name, last_name }: HackerApplicantSummary) => {
	const followWithNextLink = useFollowWithNextLink();
	return (
		<Link
			href={`/admin/applicants/hackers/${_id}`}
			fontSize="inherit"
			onFollow={followWithNextLink}
		>
			{first_name} {last_name}
		</Link>
	);
};

const DecisionStatus = ({ decision }: HackerApplicantSummary) =>
	decision ? <ApplicantStatus status={decision} /> : "-";

export default HackerApplicants;
