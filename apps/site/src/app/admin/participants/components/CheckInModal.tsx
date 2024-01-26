import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";

import { Participant } from "@/lib/admin/useParticipants";

export interface ActionModalProps {
	onDismiss: () => void;
	onConfirm: (participant: Participant) => void;
	participant: Participant | null;
}

function CheckInModal({ onDismiss, onConfirm, participant }: ActionModalProps) {
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
							Check In
						</Button>
					</SpaceBetween>
				</Box>
			}
			header={`Check In ${participant?.first_name} ${participant?.last_name}`}
		>
			<SpaceBetween size="m">
				<TextContent>
					<ul>
						{/* TODO: actual instructions for check-in associates */}
						<li>Ask for a photo ID and verify name is under attendee list.</li>
						<li>Have participant sign the SPFB sheet.</li>
						<li>Scan badge barcode with webcam or type in digits.</li>
						<li>Fill in badge and give to participant.</li>
					</ul>
				</TextContent>
				{/* TODO: badge barcode input */}
			</SpaceBetween>
		</Modal>
	);
}

export default CheckInModal;
