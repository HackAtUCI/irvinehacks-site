import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";

import type { RawNonHackerParticipant } from "./AddParticipant";

interface AddParticipantModalProps {
	onDismiss: () => void;
	onConfirm: (participant: RawNonHackerParticipant) => void;
	participant: RawNonHackerParticipant | null;
}

function AddParticipantModal({
	onDismiss,
	onConfirm,
	participant,
}: AddParticipantModalProps) {
	if (participant === null) {
		return <Modal visible={false} />;
	}

	return (
		<Modal
			onDismiss={onDismiss}
			visible={true}
			footer={
				<Box float="right">
					<SpaceBetween direction="horizontal" size="xs">
						<Button variant="link" onClick={onDismiss}>
							Cancel
						</Button>
						<Button variant="primary" onClick={() => onConfirm(participant)}>
							Add Participant
						</Button>
					</SpaceBetween>
				</Box>
			}
			header={`Add ${participant.first_name} ${participant.last_name} (${participant.email})`}
		>
			<TextContent>
				<p>Double check that this participant is correct.</p>
				<ul>
					<li>Email: {participant.email}</li>
					<li>First Name: {participant.first_name}</li>
					<li>Last Name: {participant.last_name}</li>
					<li>Role: {participant.role}</li>
				</ul>
			</TextContent>
		</Modal>
	);
}

export default AddParticipantModal;
