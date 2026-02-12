import { useState } from "react";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";
import Tiles from "@cloudscape-design/components/tiles";

import { Participant } from "@/lib/admin/useParticipants";

export interface ActionModalProps {
	onDismiss: () => void;
	onConfirm: (participant: Participant, type: string) => void;
	participant: Participant | null;
}

function CheckInModal({ onDismiss, onConfirm, participant }: ActionModalProps) {
	const [selectedType, setSelectedType] = useState("accepted");

	if (!participant) {
		return null;
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
						<Button
							variant="primary"
							onClick={() => onConfirm(participant, selectedType)}
						>
							Check In
						</Button>
					</SpaceBetween>
				</Box>
			}
			header={`Participant Name: ${participant?.first_name} ${participant?.last_name}`}
		>
			<SpaceBetween size="m">
				<TextContent>
					<ul>
						<li>
							1. Ask for a photo ID and check participant is 18+ years old.
						</li>
						<li>2. Have participant sign the SPFB sheet.</li>
						<li>3. Fill in badge and give to participant.</li>
					</ul>
				</TextContent>

				<TextContent>
					<p>Confirm participant identity and select check-in type:</p>
				</TextContent>

				<Tiles
					onChange={({ detail }) => setSelectedType(detail.value)}
					value={selectedType}
					columns={2}
					items={[
						{
							label: "General Check-In",
							value: "accepted",
						},
						{
							label: "Waitlist Queue",
							value: "waitlisted",
						},
					]}
				/>
			</SpaceBetween>
		</Modal>
	);
}

export default CheckInModal;
