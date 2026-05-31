"use client";

import {
	ReactNode,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from "react";
import { useRouter } from "next/navigation";
import Box from "@cloudscape-design/components/box";
import Cards from "@cloudscape-design/components/cards";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Checkbox from "@cloudscape-design/components/checkbox";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

import { useFollowWithNextLink } from "@/app/admin/layout/common";
import ApplicantFilters, {
	Options,
} from "@/app/admin/applicants/components/ApplicantFilters";
import { SelectProps } from "@cloudscape-design/components/select";
import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";

import UserContext from "@/lib/admin/UserContext";
import {
	isDirector,
	hasAdminRole,
	isHackerReviewer,
} from "@/lib/admin/authorization";
import ApplicantReviewerIndicator from "../components/ApplicantReviewerIndicator";
import HackerThresholdInputs from "../components/HackerThresholdInputs";

import useHackerThresholds from "@/lib/admin/useHackerThresholds";
import useAvgScoreSetting from "@/lib/admin/useAvgScoreSetting";
import useHackerApplicants, {
	HackerApplicantSummary,
} from "@/lib/admin/useHackerApplicants";
import { uidToPseudonym } from "@/lib/admin/anonymize";
import { ParticipantRole, Status } from "@/lib/userRecord";
import { OVERQUALIFIED_SCORE } from "@/lib/decisionScores";
import Badge from "@cloudscape-design/components/badge";
import Icon from "@cloudscape-design/components/icon";

type ColumnDef = {
	id: string;
	header: string;
	content: (applicant: HackerApplicantSummary) => ReactNode;
};

interface HackerApplicantsListProps {
	hackathonName: "irvinehacks" | "zothacks";
}

function HackerApplicantsList({ hackathonName }: HackerApplicantsListProps) {
	const router = useRouter();
	const { roles } = useContext(UserContext);

	if (!isHackerReviewer(roles)) {
		router.push("/admin/dashboard");
	}

	const isUserDirector = isDirector(roles);
	const isOrganizer = hasAdminRole(roles);

	const [selectedStatuses, setSelectedStatuses] = useState<Options>([]);
	const [selectedDecisions, setSelectedDecisions] = useState<Options>([]);
	const [uciNetIDFilter, setUCINetIDFilter] = useState<Options>([]);
	const [sortOption, setSortOption] = useState<SelectProps.Option>({
		value: "latest",
		label: "Newest",
	});

	const { applicantList, loading, approveDuplicateName } =
		useHackerApplicants();

	const selectedStatusValues = selectedStatuses.map(({ value }) => value);
	const selectedDecisionValues = selectedDecisions.map(({ value }) => value);
	const uciNetIDFilterValues = uciNetIDFilter.map(({ value }) => value);

	const [acceptedCount, setAcceptedCount] = useState(0);
	const [waitlistedCount, setWaitlistedCount] = useState(0);
	const [rejectedCount, setRejectCount] = useState(0);

	const { thresholds } = useHackerThresholds();
	const acceptThreshold = thresholds?.accept;
	const waitlistThreshold = thresholds?.waitlist;

	const { showWithOneReviewer } = useAvgScoreSetting();

	const [top400, setTop400] = useState(false);

	useEffect(() => {
		if (top400) {
			setSelectedStatuses([]);
			setSelectedDecisions([]);
		}
	}, [top400]);

	const filteredApplicants = applicantList.filter((applicant) => {
		if (
			selectedStatusValues.includes(Status.Pending) &&
			applicant.avg_score === OVERQUALIFIED_SCORE
		)
			return false;

		if (applicant.status === Status.Voided && isOrganizer && !isUserDirector)
			return false;

		if (
			selectedStatusValues.length !== 0 &&
			((selectedStatusValues.includes("RESUME_REVIEWED") &&
				applicant.resume_reviewed) ||
				(selectedStatusValues.includes("RESUME_NOT_REVIEWED") &&
					!applicant.resume_reviewed))
		) {
			return true;
		}

		return (
			(selectedStatuses.length === 0 ||
				selectedStatusValues.includes(applicant.status)) &&
			(selectedDecisions.length === 0 ||
				selectedDecisionValues.includes(
					applicant.director_previous_experience_reviewed
						? applicant.decision || "-"
						: "-",
				)) &&
			(uciNetIDFilter.length === 0 ||
				applicant.reviewers.some((reviewer) =>
					uciNetIDFilterValues.includes(reviewer),
				))
		);
	});

	const filteredApplicants400 = [...applicantList]
		.filter(
			(applicant) =>
				applicant.director_previous_experience_reviewed &&
				applicant.avg_score !== -1,
		)
		.sort((a, b) => b.avg_score - a.avg_score)
		.slice(0, 400);

	useEffect(() => {
		const accepted = acceptThreshold ? acceptThreshold : 0;
		const waitlisted = waitlistThreshold ? waitlistThreshold : 0;

		const scoreReadyApplicants = applicantList.filter(
			(applicant) => applicant.director_previous_experience_reviewed,
		);

		const acceptedCount = scoreReadyApplicants.filter(
			(applicant) => applicant.avg_score >= accepted,
		).length;
		setAcceptedCount(acceptedCount);

		const waitlistedCount = scoreReadyApplicants.filter(
			(applicant) =>
				applicant.avg_score >= waitlisted && applicant.avg_score < accepted,
		).length;
		setWaitlistedCount(waitlistedCount);

		const rejectedCount = scoreReadyApplicants.filter(
			(applicant) => applicant.avg_score < waitlisted,
		).length;
		setRejectCount(rejectedCount);
	}, [applicantList, acceptThreshold, waitlistThreshold]);

	const baseItems = top400 ? filteredApplicants400 : filteredApplicants;
	const items = useMemo(() => {
		if (!sortOption?.value) return baseItems;
		return [...baseItems].sort((a, b) => {
			switch (sortOption.value) {
				case "first_name_asc":
					return a.first_name.localeCompare(b.first_name);
				case "first_name_desc":
					return b.first_name.localeCompare(a.first_name);
				case "latest":
					return (
						new Date(b.application_data.submission_time).getTime() -
						new Date(a.application_data.submission_time).getTime()
					);
				case "oldest":
					return (
						new Date(a.application_data.submission_time).getTime() -
						new Date(b.application_data.submission_time).getTime()
					);
				default:
					return 0;
			}
		});
	}, [baseItems, sortOption]);

	const counter =
		selectedStatuses.length > 0 ||
		selectedDecisions.length > 0 ||
		uciNetIDFilter.length > 0
			? `(${items.length}/${applicantList.length})`
			: `(${applicantList.length})`;

	const emptyContent = (
		<Box textAlign="center" color="inherit">
			No applicants
		</Box>
	);

	const zothacksExtraColumn: ColumnDef = {
		id: "year",
		header: "Year",
		content: ({ application_data }) => application_data.school_year,
	};

	const irvinehacksExtraColumn: ColumnDef = {
		id: "school",
		header: "School",
		content: ({ application_data }) => application_data.school,
	};

	const extraColumn =
		hackathonName === "zothacks" ? zothacksExtraColumn : irvinehacksExtraColumn;

	const resumeReviewedColumn = {
		id: "resume_reviewed",
		header: "Resume Reviewed Status",
		content: ResumeReviewedStatus,
	};

	const directorPreviousExperienceReviewedColumn = {
		id: "director_previous_experience_reviewed",
		header: "Director Review",
		content: DirectorPreviousExperienceReviewedStatus,
	};
	const duplicateNames = useMemo(() => {
		if (!isUserDirector) return new Set<string>();

		const nameCounts = new Map<string, number>();

		for (const { first_name, last_name } of applicantList) {
			const name = `${first_name} ${last_name}`.trim().toLowerCase();
			if (!name) continue;
			nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
		}

		return new Set(
			[...nameCounts.entries()]
				.filter(([, count]) => count > 1)
				.map(([name]) => name),
		);
	}, [applicantList, isUserDirector]);

	const renderHeader = useCallback(
		({
			_id,
			first_name,
			last_name,
			avg_score,
			director_previous_experience_reviewed,
			duplicate_name_approved,
		}: HackerApplicantSummary) => (
			<CardHeader
				_id={_id}
				first_name={first_name}
				last_name={last_name}
				hackathonName={hackathonName}
				avg_score={avg_score}
				director_previous_experience_reviewed={
					director_previous_experience_reviewed
				}
				isDirector={isUserDirector}
				isDuplicate={
					isUserDirector &&
					duplicateNames.has(`${first_name} ${last_name}`.trim().toLowerCase())
				}
				duplicateNameApproved={duplicate_name_approved}
				onApproveDuplicate={(approved) => approveDuplicateName(_id, approved)}
			/>
		),
		[hackathonName, duplicateNames, isUserDirector, approveDuplicateName],
	);

	const avgScore = ({
		avg_score,
		reviewers,
		director_previous_experience_reviewed,
	}: HackerApplicantSummary) => {
		if (!director_previous_experience_reviewed) return "-";
		if (avg_score === OVERQUALIFIED_SCORE)
			return <Box color="text-status-error">OVERQUALIFIED</Box>;
		if (avg_score === -1) return "-";
		if (reviewers.length < 2 && !showWithOneReviewer) return "-";
		return avg_score.toFixed(3);
	};

	return (
		<Cards
			cardDefinition={{
				header: renderHeader,
				sections: [
					{
						id: "uid",
						header: "UID",
						content: ({ _id }) => (isUserDirector ? _id : uidToPseudonym(_id)),
					},
					...(isUserDirector ? [extraColumn] : []),
					...(isUserDirector ? [directorPreviousExperienceReviewedColumn] : []),
					{
						id: "status",
						header: "Status",
						content: ApplicantStatus,
					},
					...(hackathonName === "zothacks" ? [resumeReviewedColumn] : []),
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
						content: avgScore,
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
				isUserDirector ? (
					<ApplicantFilters
						selectedStatuses={selectedStatuses}
						setSelectedStatuses={setSelectedStatuses}
						selectedDecisions={selectedDecisions}
						setSelectedDecisions={setSelectedDecisions}
						uciNetIDFilter={uciNetIDFilter}
						setUCINetIDFilter={setUCINetIDFilter}
						applicantType={ParticipantRole.Hacker}
						sortOption={sortOption}
						setSortOption={setSortOption}
					/>
				) : null
			}
			empty={emptyContent}
			header={
				<div>
					<Header actions={isUserDirector && <HackerThresholdInputs />}>
						Hacker Applicants {counter}
						<div
							style={{
								fontSize: "0.875rem",
								color: "#5f6b7a",
								marginTop: "4px",
							}}
						>
							{acceptedCount} applicants with &quot;accepted&quot; status
						</div>
						<div
							style={{
								fontSize: "0.875rem",
								color: "#5f6b7a",
								marginTop: "4px",
							}}
						>
							{waitlistedCount} applicants with &quot;waitlisted&quot; status
						</div>
						<div
							style={{
								fontSize: "0.875rem",
								color: "#5f6b7a",
								marginTop: "4px",
							}}
						>
							{rejectedCount} applicants with &quot;rejected&quot; status
						</div>
					</Header>
					<Checkbox
						checked={top400}
						onChange={({ detail }) => setTop400(detail.checked)}
					>
						Show Top 400 Scores
					</Checkbox>
					<span>
						{top400 &&
							"Highest score: " + (filteredApplicants400[0]?.avg_score ?? "-")}
						<br />
						{top400 &&
							"Lowest score: " +
								(filteredApplicants400[filteredApplicants400.length - 1]
									?.avg_score ?? "-")}
					</span>
				</div>
			}
		/>
	);
}

const CardHeader = ({
	_id,
	first_name,
	last_name,
	hackathonName,
	avg_score,
	director_previous_experience_reviewed,
	isDirector,
	isDuplicate,
	duplicateNameApproved,
	onApproveDuplicate,
}: Pick<
	HackerApplicantSummary,
	| "_id"
	| "first_name"
	| "last_name"
	| "avg_score"
	| "director_previous_experience_reviewed"
> & {
	hackathonName: "irvinehacks" | "zothacks";
	isDirector: boolean;
	isDuplicate: boolean;
	duplicateNameApproved: boolean;
	onApproveDuplicate: (approved: boolean) => void;
}) => {
	const followWithNextLink = useFollowWithNextLink();
	const href =
		hackathonName === "zothacks"
			? `/admin/applicants/zothacks-hackers/${_id}`
			: `/admin/applicants/hackers/${_id}`;
	const displayName = isDirector
		? `${first_name} ${last_name}`
		: uidToPseudonym(_id);

	const duplicateIcon =
		isDuplicate &&
		(duplicateNameApproved ? (
			<span
				title={
					isDirector
						? "Duplicate name approved: click to revoke"
						: "Duplicate name verified by director"
				}
				style={{
					display: "flex",
					alignItems: "center",
					cursor: isDirector ? "pointer" : "default",
				}}
				onClick={isDirector ? () => onApproveDuplicate(false) : undefined}
			>
				<Icon name="status-positive" variant="success" />
			</span>
		) : (
			<span
				title={
					isDirector
						? "Duplicate name: click to approve"
						: "Duplicate name; possibly applied multiple times"
				}
				style={{
					display: "flex",
					alignItems: "center",
					cursor: isDirector ? "pointer" : "default",
				}}
				onClick={isDirector ? () => onApproveDuplicate(true) : undefined}
			>
				<Icon name="status-warning" variant="warning" />
			</span>
		));

	return (
		<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
			<Link href={href} fontSize="inherit" onFollow={followWithNextLink}>
				{displayName}
			</Link>
			{director_previous_experience_reviewed &&
				avg_score === OVERQUALIFIED_SCORE && (
					<Badge color="red">OVERQUALIFIED</Badge>
				)}
			{duplicateIcon}
		</div>
	);
};

const DecisionStatus = ({
	decision,
	director_previous_experience_reviewed,
}: HackerApplicantSummary) =>
	director_previous_experience_reviewed && decision ? (
		<ApplicantStatus status={decision} />
	) : (
		"-"
	);

const ResumeReviewedStatus = ({ resume_reviewed }: HackerApplicantSummary) => (
	<ApplicantStatus
		status={resume_reviewed ? Status.Reviewed : Status.Pending}
	/>
);

const DirectorPreviousExperienceReviewedStatus = ({
	director_previous_experience_reviewed,
}: HackerApplicantSummary) => (
	<StatusIndicator
		type={director_previous_experience_reviewed ? "success" : "pending"}
	>
		{director_previous_experience_reviewed ? "Reviewed" : "Not Reviewed"}
	</StatusIndicator>
);

export default HackerApplicantsList;
