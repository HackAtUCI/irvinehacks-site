import { Dispatch, SetStateAction } from "react";

import FormField from "@cloudscape-design/components/form-field";
import { IconProps } from "@cloudscape-design/components/icon";
import Multiselect from "@cloudscape-design/components/multiselect";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextFilter, {
    TextFilterProps
} from "@cloudscape-design/components/text-filter";

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

function ParticipantsFilters({
    filteredItemsCount,
    filterProps,
    roles,
    selectedRoles,
    setSelectedRoles,
    statuses,
    selectedStatuses,
    setSelectedStatuses
}: ParticipantsFiltersProps) {
    return (
        <SpaceBetween size="l" direction="horizontal">
            <div style={{ marginTop: "24px" }}>
                <TextFilter
                    {...filterProps}
                    countText={filteredItemsCount === 1 ? '1 participant' : `${filteredItemsCount} participants`}
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
                    options={statuses}
                    selectedAriaLabel="Selected"
                    selectedOptions={selectedStatuses}
                    onChange={(event) => setSelectedStatuses(event.detail.selectedOptions)}
                    expandToViewport={true}
                />
            </FormField>
        </SpaceBetween>
        
    )
}

export default ParticipantsFilters;