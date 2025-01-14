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
	uciNetIdFilter?: Options;
	setuciNetIdFilter?: Dispatch<SetStateAction<Options>>;

	applicantType: ParticipantRole;
}

const StatusIcons: Record<Status, IconProps.Name> = {
	[ReviewStatus.pending]: "status-pending",
	[ReviewStatus.reviewed]: "status-in-progress",
	[ReviewStatus.released]: "status-positive",
	[Decision.accepted]: "status-positive",
	[Decision.rejected]: "status-pending",
	[Decision.waitlisted]: "status-negative",
	[PostAcceptedStatus.signed]: "status-in-progress",
	[PostAcceptedStatus.confirmed]: "status-positive",
	[PostAcceptedStatus.attending]: "status-positive",
	[PostAcceptedStatus.void]: "status-negative",
};

const statusOption = (status: Status): MultiselectProps.Option => ({
	label: StatusLabels[status],
	value: status,
	iconName: StatusIcons[status],
});

const STATUS_OPTIONS = Object.values(ReviewStatus).map(statusOption);

const DECISION_OPTIONS = Object.values(Decision).map(statusOption);

function ApplicantFilters({
	selectedStatuses,
	setSelectedStatuses,
	selectedDecisions,
	setSelectedDecisions,
	uciNetIdFilter,
	setuciNetIdFilter,
	applicantType,
}: ApplicantFiltersProps) {
	const { applicantList, loading } = useHackerApplicants();

	let reviewerOptions: Options = [];
	if (!loading && applicantList.length > 0) {
		const reviewerIdsSet = new Set(
			applicantList.flatMap((applicant) => applicant.reviewers || []),
		);

		const reviewerIds = Array.from(reviewerIdsSet);

		reviewerOptions = reviewerIds.map((id) => ({
			label: id.split(".")[2],
			value: id,
		}));
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
			{applicantType === ParticipantRole.Hacker ? (
				<Multiselect
					selectedOptions={uciNetIdFilter ?? []}
					onChange={({ detail }) => setuciNetIdFilter?.(detail.selectedOptions)}
					deselectAriaLabel={(e) => `Remove ${e.label}`}
					options={reviewerOptions}
					placeholder="Search by Reviewer's UCINetID"
					selectedAriaLabel="Selected"
				/>
			) : null}
		</ColumnLayout>
	);
}

export default ApplicantFilters;
