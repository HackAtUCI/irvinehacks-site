import Box from "@cloudscape-design/components/box";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";

import { ScoreRange, isInvalidRange } from "../scoreFilters";

interface ScoreRangeFilterProps {
	label: string;
	range: ScoreRange;
	onChange: (range: ScoreRange) => void;
}

function ScoreRangeFilter({ label, range, onChange }: ScoreRangeFilterProps) {
	const invalid = isInvalidRange(range);

	return (
		<FormField
			label={label}
			errorText={invalid && "Min can't be greater than max"}
		>
			<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
				<div style={{ width: "6rem" }}>
					<Input
						type="number"
						step="any"
						value={range.min}
						onChange={({ detail }) => onChange({ ...range, min: detail.value })}
						placeholder="Min"
						ariaLabel={`Minimum ${label}`}
						invalid={invalid}
					/>
				</div>
				<Box>to</Box>
				<div style={{ width: "6rem" }}>
					<Input
						type="number"
						step="any"
						value={range.max}
						onChange={({ detail }) => onChange({ ...range, max: detail.value })}
						placeholder="Max"
						ariaLabel={`Maximum ${label}`}
						invalid={invalid}
					/>
				</div>
			</div>
		</FormField>
	);
}

export default ScoreRangeFilter;
