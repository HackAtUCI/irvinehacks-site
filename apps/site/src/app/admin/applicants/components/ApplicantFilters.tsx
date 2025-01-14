import { Dispatch, SetStateAction } from "react";

import ColumnLayout from "@cloudscape-design/components/column-layout";
import { IconProps } from "@cloudscape-design/components/icon";
import Multiselect, {
	MultiselectProps,
} from "@cloudscape-design/components/multiselect";
import Input from "@cloudscape-design/components/input";

import {
	Decision,
	ReviewStatus,
	Status,
	PostAcceptedStatus,
} from "@/lib/userRecord";

import { StatusLabels } from "./ApplicantStatus";

export type Options = ReadonlyArray<MultiselectProps.Option>;

interface ApplicantFiltersProps {
	selectedStatuses: Options;
	setSelectedStatuses: Dispatch<SetStateAction<Options>>;
	selectedDecisions: Options;
	setSelectedDecisions: Dispatch<SetStateAction<Options>>;
	uidFilter?: string; 
	setUidFilter?: Dispatch<SetStateAction<string>>; 
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
	uidFilter,
	setUidFilter,

}: ApplicantFiltersProps) {
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
			<Input
				value={uidFilter ?? ""} 
				onChange={(event) => setUidFilter?.(event.detail.value)} 
				placeholder="Search by Reviewer's UID"
				ariaLabel="Search by Reviewer's UID"
				/>

		</ColumnLayout>
	);
}

export default ApplicantFilters;
