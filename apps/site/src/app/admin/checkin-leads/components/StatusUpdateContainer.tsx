import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";

import ActionSelector from "./ActionSelector";

interface StatusUpdateContainerProps {
	selectedAction: SelectProps.Option | null;
	onActionChange: (option: SelectProps.Option | null) => void;
	onUpdate: () => void;
	loading: boolean;
	message: {
		type: "success" | "error";
		text: string;
	} | null;
	onDismissMessage: () => void;
}

export default function StatusUpdateContainer({
	selectedAction,
	onActionChange,
	onUpdate,
	loading,
	message,
	onDismissMessage,
}: StatusUpdateContainerProps) {
	return (
		<Container header={<Box variant="h2">Update Statuses</Box>}>
			<SpaceBetween size="l">
				<ActionSelector
					selectedAction={selectedAction}
					onActionChange={onActionChange}
					onUpdate={onUpdate}
					loading={loading}
				/>
				{message && (
					<Alert type={message.type} dismissible onDismiss={onDismissMessage}>
						{message.text}
					</Alert>
				)}
			</SpaceBetween>
		</Container>
	);
}
