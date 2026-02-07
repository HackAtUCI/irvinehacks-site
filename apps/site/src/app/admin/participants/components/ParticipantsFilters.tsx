import { Dispatch, SetStateAction } from "react";

import FormField from "@cloudscape-design/components/form-field";
import { IconProps } from "@cloudscape-design/components/icon";
import Multiselect, {
	MultiselectProps,
} from "@cloudscape-design/components/multiselect";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextFilter, {
	TextFilterProps,
} from "@cloudscape-design/components/text-filter";

import {
	Decision,
	PostAcceptedStatus,
	ReviewStatus,
	Status,
} from "@/lib/userRecord";

import { StatusLabels } from "@/app/admin/applicants/components/ApplicantStatus";

import type { Options } from "./ParticipantsTable";

interface ParticipantsFiltersProps {
	filteredItemsCount: number | undefined;
	filterProps: TextFilterProps;
	roles: Options;
	selectedRoles: Options;
	setSelectedRoles: Dispatch<SetStateAction<Options>>;
	statuses: Options;
	selectedStatuses: Options;
	setSelectedStatuses: Dispatch<SetStateAction<Options>>;
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

const statusOption = (status: MultiselectProps.Option) => {
	if (status.value === undefined) {
		throw Error();
	}
	return {
		label: StatusLabels[status.value as Status],
		value: status.value,
		iconName: StatusIcons[status.value as Status],
	};
};

function ParticipantsFilters({
	filteredItemsCount,
	filterProps,
	roles,
	selectedRoles,
	setSelectedRoles,
	statuses,
	selectedStatuses,
	setSelectedStatuses,
}: ParticipantsFiltersProps) {
	return (
		<SpaceBetween size="l" direction="horizontal">
			<div style={{ marginTop: "24px" }}>
				<TextFilter
					{...filterProps}
					countText={
						filteredItemsCount === 1
							? "1 participant"
							: `${filteredItemsCount} participants`
					}
					filteringAriaLabel="Filter participants"
					filteringPlaceholder="Search participants"
				/>
			</div>
			<FormField label="Role">
				<Multiselect
					data-testid="role-filter"
					placeholder="Filter by role"
					options={roles}
					selectedAriaLabel="Selected"
					selectedOptions={selectedRoles}
					onChange={(event) => setSelectedRoles(event.detail.selectedOptions)}
					expandToViewport={true}
				/>
			</FormField>
			<FormField label="Status">
				<Multiselect
					data-testid="status-filter"
					placeholder="Filter by status"
					options={statuses.map(statusOption)}
					selectedAriaLabel="Selected"
					selectedOptions={selectedStatuses}
					onChange={(event) =>
						setSelectedStatuses(event.detail.selectedOptions)
					}
					expandToViewport={true}
				/>
			</FormField>
		</SpaceBetween>
	);
}

export default ParticipantsFilters;
