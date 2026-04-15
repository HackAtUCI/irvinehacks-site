import { Dispatch, SetStateAction } from "react";

import ColumnLayout from "@cloudscape-design/components/column-layout";
import { IconProps } from "@cloudscape-design/components/icon";
import Multiselect, {
	MultiselectProps,
} from "@cloudscape-design/components/multiselect";

import {
	Decision,
	ReviewStatus,
	Status,
	PostAcceptedStatus,
} from "@/lib/userRecord";
import { ParticipantRole } from "@/lib/userRecord";

import { StatusLabels } from "./ApplicantStatus";

import useHackerApplicants from "@/lib/admin/useHackerApplicants";

export type Options = ReadonlyArray<MultiselectProps.Option>;

interface ApplicantFiltersProps {
	selectedStatuses: Options;
	setSelectedStatuses: Dispatch<SetStateAction<Options>>;
	selectedDecisions: Options;
	setSelectedDecisions: Dispatch<SetStateAction<Options>>;
	uciNetIDFilter?: Options;
	setUCINetIDFilter?: Dispatch<SetStateAction<Options>>;
	applicantType: ParticipantRole;
}

const StatusIcons: Record<Status, IconProps.Name> = {
	[ReviewStatus.Pending]: "status-pending",
	[ReviewStatus.Reviewed]: "status-in-progress",
	[Decision.Accepted]: "status-positive",
	[Decision.Rejected]: "status-pending",
	[Decision.Waitlisted]: "status-negative",
	[PostAcceptedStatus.Signed]: "status-in-progress",
	[PostAcceptedStatus.Confirmed]: "status-positive",
	[PostAcceptedStatus.Attending]: "status-positive",
	[PostAcceptedStatus.Queued]: "status-in-progress",
};

const statusOption = (status: Status): MultiselectProps.Option => ({
	label: StatusLabels[status],
	value: status,
	iconName: StatusIcons[status],
});

const RESUME_REVIEW_OPTIONS: Options = [
	{
		label: "Resume Reviewed",
		value: "RESUME_REVIEWED",
		iconName: "status-positive",
	},
	{
		label: "Resume Not Reviewed",
		value: "RESUME_NOT_REVIEWED",
		iconName: "status-pending",
	},
];

const VOIDED_OPTION: MultiselectProps.Option = {
	label: "voided",
	value: "VOIDED",
	iconName: "status-stopped",
};

const STATUS_OPTIONS = Object.values(ReviewStatus)
	.map(statusOption)
	.concat(RESUME_REVIEW_OPTIONS);

const DECISION_OPTIONS = Object.values(Decision)
	.map(statusOption)
	.concat([VOIDED_OPTION]);

function ApplicantFilters({
	selectedStatuses,
	setSelectedStatuses,
	selectedDecisions,
	setSelectedDecisions,
	uciNetIDFilter,
	setUCINetIDFilter,
	applicantType,
}: ApplicantFiltersProps) {
	const { applicantList, loading } = useHackerApplicants();

	let reviewerOptions: Options = [];
	if (!loading && applicantList.length > 0) {
		const reviewerCountMap = new Map<string, number>();

		for (const applicant of applicantList) {
			for (const id of applicant.reviewers || []) {
				reviewerCountMap.set(id, (reviewerCountMap.get(id) ?? 0) + 1);
			}
		}

		reviewerOptions = Array.from(reviewerCountMap.entries()).map(
			([id, count]) => ({
				label: `${id.split(".")[2]} - ${count} application${
					count === 1 ? "" : "s"
				} reviewed`,
				value: id,
			}),
		);
	}

	return (
		<ColumnLayout columns={3}>
			<Multiselect
				selectedOptions={selectedStatuses}
				onChange={({ detail }) => setSelectedStatuses(detail.selectedOptions)}
				deselectAriaLabel={(e) => `Remove ${e.label}`}
				options={STATUS_OPTIONS}
				placeholder="Choose statuses"
				selectedAriaLabel="Selected"
			/>
			<Multiselect
				selectedOptions={selectedDecisions}
				onChange={({ detail }) => setSelectedDecisions(detail.selectedOptions)}
				deselectAriaLabel={(e) => `Remove ${e.label}`}
				options={DECISION_OPTIONS}
				placeholder="Choose reviews"
				selectedAriaLabel="Selected"
			/>
			{applicantType === ParticipantRole.Hacker && (
				<Multiselect
					selectedOptions={uciNetIDFilter ?? []}
					onChange={({ detail }) => setUCINetIDFilter?.(detail.selectedOptions)}
					deselectAriaLabel={(e) => `Remove ${e.label}`}
					options={reviewerOptions}
					placeholder="Search by Reviewer's UCINetID"
					selectedAriaLabel="Selected"
				/>
			)}
		</ColumnLayout>
	);
}

export default ApplicantFilters;
