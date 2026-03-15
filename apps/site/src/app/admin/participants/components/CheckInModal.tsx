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
				{selectedType === "accepted" && (
					<div>
						<p>
							<strong>General Check-in Instructions</strong>
						</p>
						<TextContent>
							<ol>
								<li>
									Ask for a photo ID and check participant is 18+ years old.
								</li>
								<li>Have participant sign the SPFB sheet.</li>
								<li>
									Check if the participant has joined Slack (there is a column
									to indicate it). If not, ask a check-in lead to add them.
								</li>
								<li>Ask participant to fill in badge.</li>
								<li>
									Inform participant regarding the following:
									<ol>
										<li>Can head inside ballroom to talk to sponsors.</li>
										<li>Team formation starts at 7pm at Moss Cove B.</li>
										<li>Opening ceremony starts at 8pm.</li>
										<li>
											Schedule is available on website at
											<b> irvinehacks.com/schedule.</b>
										</li>
									</ol>
								</li>
							</ol>
						</TextContent>
					</div>
				)}

				{selectedType === "waitlisted" && (
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
											Participants have 15 minutes to check in starting from
											email notification sent or they will have to come in
											person to rejoin the queue.
										</li>
										<li>
											We will start calling people off waitlist to check in at
											6pm.
										</li>
									</ol>
								</li>
							</ol>
						</TextContent>
					</div>
				)}

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
