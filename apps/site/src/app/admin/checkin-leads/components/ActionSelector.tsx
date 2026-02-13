import Button from "@cloudscape-design/components/button";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { actions } from "./StatusOptions";

interface ActionSelectorProps {
	selectedAction: SelectProps.Option | null;
	onActionChange: (option: SelectProps.Option | null) => void;
	onUpdate: () => void;
	loading: boolean;
}

export default function ActionSelector({
	selectedAction,
	onActionChange,
	onUpdate,
	loading,
}: ActionSelectorProps) {
	return (
		<SpaceBetween size="m">
			<Select
				selectedOption={selectedAction}
				onChange={({ detail }) => onActionChange(detail.selectedOption)}
				options={actions}
				placeholder="Select an action"
			/>
			<Button
				onClick={onUpdate}
				disabled={!selectedAction || loading}
				loading={loading}
				variant="primary"
			>
				Update
			</Button>
		</SpaceBetween>
	);
}
