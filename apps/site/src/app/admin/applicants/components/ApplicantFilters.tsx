import { Dispatch, SetStateAction } from "react";

import ColumnLayout from "@cloudscape-design/components/column-layout";
import { IconProps } from "@cloudscape-design/components/icon";
import { OptionDefinition } from "@cloudscape-design/components/internal/components/option/interfaces";
import Multiselect from "@cloudscape-design/components/multiselect";

import { StatusLabels } from "admin/components/ApplicantStatus/ApplicantStatus";
import { Decision, ReviewStatus, Status } from "admin/utils/useApplicant";

interface ApplicantFiltersProps {
	selectedStatuses: readonly OptionDefinition[];
	setSelectedStatuses: Dispatch<SetStateAction<readonly OptionDefinition[]>>;
	selectedDecisions: readonly OptionDefinition[];
	setSelectedDecisions: Dispatch<SetStateAction<readonly OptionDefinition[]>>;
}

const StatusIcons: Record<Status, IconProps.Name> = {
	[ReviewStatus.pending]: "status-pending",
	[ReviewStatus.reviewed]: "status-in-progress",
	[ReviewStatus.released]: "status-positive",
	[Decision.accepted]: "status-positive",
	[Decision.rejected]: "status-pending",
	[Decision.waitlisted]: "status-negative",
};

const statusOption = (status: Status) => ({
	label: StatusLabels[status],
	value: status,
	iconName: StatusIcons[status],
});

const STATUS_OPTIONS: OptionDefinition[] =
	Object.values(ReviewStatus).map(statusOption);

const DECISION_OPTIONS: OptionDefinition[] =
	Object.values(Decision).map(statusOption);

function ApplicantFilters({
	selectedStatuses,
	setSelectedStatuses,
	selectedDecisions,
	setSelectedDecisions,
}: ApplicantFiltersProps) {
	return (
		<ColumnLayout columns={2}>
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
		</ColumnLayout>
	);
}

export default ApplicantFilters;
