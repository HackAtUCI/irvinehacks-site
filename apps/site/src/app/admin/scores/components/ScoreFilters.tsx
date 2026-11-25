import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Multiselect from "@cloudscape-design/components/multiselect";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { Decision } from "@/lib/userRecord";

import { ScoreFilterValues } from "../scoreFilters";
import ScoreRangeFilter from "./ScoreRangeFilter";

const DECISION_OPTIONS = [
	{ label: "Accepted", value: Decision.Accepted },
	{ label: "Waitlisted", value: Decision.Waitlisted },
	{ label: "Rejected", value: Decision.Rejected },
];

interface ScoreFiltersProps {
	filters: ScoreFilterValues;
	onChange: (filters: ScoreFilterValues) => void;
	onClear: () => void;
	matchCount: number;
	totalCount: number;
}

function ScoreFilters({
	filters,
	onChange,
	onClear,
	matchCount,
	totalCount,
}: ScoreFiltersProps) {
	return (
		<SpaceBetween size="xs">
			<SpaceBetween size="l" direction="horizontal">
				<ScoreRangeFilter
					label="Raw Score"
					range={filters.rawScore}
					onChange={(rawScore) => onChange({ ...filters, rawScore })}
				/>
				<ScoreRangeFilter
					label="Normalized Score"
					range={filters.normalizedScore}
					onChange={(normalizedScore) =>
						onChange({ ...filters, normalizedScore })
					}
				/>
				<FormField label="Decision">
					<Multiselect
						placeholder="Filter by decision"
						options={DECISION_OPTIONS}
						selectedOptions={DECISION_OPTIONS.filter(({ value }) =>
							filters.decisions.includes(value),
						)}
						onChange={({ detail }) =>
							onChange({
								...filters,
								decisions: detail.selectedOptions.map(
									({ value }) => value as Decision,
								),
							})
						}
						selectedAriaLabel="Selected"
						deselectAriaLabel={({ label }) => `Remove ${label}`}
						expandToViewport
					/>
				</FormField>
			</SpaceBetween>
			<SpaceBetween size="m" direction="horizontal" alignItems="center">
				<Box color="text-body-secondary">
					{`${matchCount} of ${totalCount} applicants`}
				</Box>
				<Button variant="inline-link" onClick={onClear}>
					Clear filters
				</Button>
			</SpaceBetween>
		</SpaceBetween>
	);
}

export default ScoreFilters;
