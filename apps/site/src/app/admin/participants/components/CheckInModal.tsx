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
			<SpaceBetween size="s">
				<div>
					<p>
						<strong>General Check-in Instructions</strong>
					</p>
					<TextContent>
						<ul>
							<ol>
								<li>
									Ask for a photo ID and check participant is 18+ years old.
								</li>
								<li>Have participant sign the SPFB sheet.</li>
								<li>Ask participant to fill in badge.</li>
							</ol>
						</ul>
					</TextContent>
				</div>

				<div>
					<p>
						<strong>Queue Instructions</strong>
					</p>
					<TextContent>
						<ol>
							<li>
								Ask for a photo ID and check participant is 18+ years old.
							</li>
							<li>
								Inform participant regarding the following:
								<ol>
									<li>Turn on email notifications.</li>
									<li>
										Participants have 15 minutes to check in starting from email
										notification sent or they will have to come in person to
										rejoin the queue.
									</li>
									<li>Waitlist check in starts at 6pm.</li>
								</ol>
							</li>
						</ol>
						<hr
							style={{
								border: "0",
								borderTop: "1px solid #ddd",
								margin: "20px 0",
							}}
						/>
						<p>Select check-in type:</p>
					</TextContent>
				</div>

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
