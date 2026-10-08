import { useEffect, useState } from "react";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";
import Tiles from "@cloudscape-design/components/tiles";

import { Participant } from "@/lib/admin/useParticipants";
import { ParticipantRole } from "@/lib/userRecord";

export interface ActionModalProps {
	onDismiss: () => void;
	onConfirm: (participant: Participant, type: string) => void;
	participant: Participant | null;
	checkInConfirmed: boolean;
}

function getPrimaryRole(roles: ReadonlyArray<ParticipantRole> = []): ParticipantRole | "General" {
	if (roles.includes(ParticipantRole.Judge)) return ParticipantRole.Judge;
	if (roles.includes(ParticipantRole.Sponsor)) return ParticipantRole.Sponsor;
	if (roles.includes(ParticipantRole.WorkshopLead)) return ParticipantRole.WorkshopLead;
	if (roles.includes(ParticipantRole.Mentor)) return ParticipantRole.Mentor;
	if (roles.includes(ParticipantRole.Volunteer)) return ParticipantRole.Volunteer;
	if (
		roles.includes(ParticipantRole.Hacker) ||
		roles.includes(ParticipantRole.ZotHacks_Hacker) ||
		roles.includes(ParticipantRole.Applicant)
	) {
		return ParticipantRole.Hacker;
	}
	if (roles.includes(ParticipantRole.Guest)) return ParticipantRole.Guest;
	return "General";
}

function CheckInModal({
	onDismiss,
	onConfirm,
	participant,
	checkInConfirmed,
}: ActionModalProps) {
	const [selectedType, setSelectedType] = useState("accepted");
	const [showExitWarning, setShowExitWarning] = useState(false);

	useEffect(() => {
		setShowExitWarning(false);
		setSelectedType("accepted");
	}, [participant]);

	if (!participant) {
		return null;
	}

	const primaryRole = getPrimaryRole(participant.roles);

	const handleDismiss = () => {
		if (showExitWarning || checkInConfirmed) {
			onDismiss();
		} else {
			setShowExitWarning(true);
		}
	};

	if (checkInConfirmed) {
		return (
			<Modal
				onDismiss={onDismiss}
				visible={true}
				footer={
					<Box float="right">
						<Button variant="primary" onClick={onDismiss}>
							Close
						</Button>
					</Box>
				}
				header={`Participant Name: ${participant.first_name} ${participant.last_name}`}
			>
				<Alert type="success">
					{participant.first_name} {participant.last_name} has been successfully
					checked in!
				</Alert>
			</Modal>
		);
	}

	return (
		<Modal
			onDismiss={handleDismiss}
			visible={true}
			footer={
				<Box float="right">
					<SpaceBetween direction="horizontal" size="xs">
						{showExitWarning ? (
							<Button variant="link" onClick={onDismiss}>
								Exit Anyway
							</Button>
						) : (
							<Button variant="link" onClick={handleDismiss}>
								Cancel
							</Button>
						)}
						<Button
							variant="primary"
							onClick={() => onConfirm(participant, selectedType)}
						>
							Check In
						</Button>
					</SpaceBetween>
				</Box>
			}
			header={`Participant Name: ${participant.first_name} ${participant.last_name}`}
		>
			<SpaceBetween size="s">
				{showExitWarning && (
					<Alert type="warning">
						You haven&apos;t checked in this participant yet.
					</Alert>
				)}

				{selectedType === "accepted" && (
					<div>
						<p>
							<strong>
								{primaryRole === ParticipantRole.Hacker || primaryRole === ParticipantRole.Mentor
									? "Hacker / Mentor"
									: primaryRole === "General"
									? "General"
									: primaryRole}{" "}
								Check-in Instructions
							</strong>
						</p>
						<TextContent>
							{(primaryRole === ParticipantRole.Hacker ||
								primaryRole === ParticipantRole.Mentor) && (
								<ul style={{ listStyle: "none", padding: 0 }}>
									<li>
										<label>
											<input type="checkbox" /> Check ID photo matches participant&apos;s face
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Check participant&apos;s{" "}
											<strong>date of birth</strong> is before or on{" "}
											<strong>October 16, 2008</strong>
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Ask participant to sign the SPFB sheet
										</label>
									</li>
									<li>
										<label>
											<input
												type="checkbox"
												defaultChecked={!!participant.is_added_to_discord}
												disabled={!!participant.is_added_to_discord}
											/>{" "}
											Joined Discord? If not, ask for check-in lead
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Provide / ask to fill out badge
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Inform participant regarding the following:
										</label>
										<ul style={{ listStyle: "none", padding: "0 0 0 1.5rem" }}>
											<li>
												<label>
													<input type="checkbox" /> Intro Presentation starts at 7pm
												</label>
											</li>
											<li>
												<label>
													<input type="checkbox" /> Icebreakers &amp; Ideation start after, at 7:30pm
												</label>
											</li>
											<li>
												<label>
													<input type="checkbox" /> Check-in starts at 8am tomorrow
												</label>
											</li>
										</ul>
									</li>
								</ul>
							)}

							{primaryRole === ParticipantRole.Judge && (
								<ul style={{ listStyle: "none", padding: 0 }}>
									<li>
										<label>
											<input type="checkbox" /> Ask participant to sign the SPFB sheet
										</label>
									</li>
									<li>
										<label>
											<input
												type="checkbox"
												defaultChecked={!!participant.is_added_to_discord}
												disabled={!!participant.is_added_to_discord}
											/>{" "}
											Joined Discord? If not, ask for check-in lead
										</label>
										<ul style={{ listStyle: "none", padding: "0 0 0 1.5rem" }}>
											<li>
												<label>
													<input type="checkbox" /> Ideally, they join the Discord, but they can opt out
												</label>
											</li>
										</ul>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Provide / ask to fill out badge
										</label>
									</li>
								</ul>
							)}

							{primaryRole === ParticipantRole.Sponsor && (
								<ul style={{ listStyle: "none", padding: 0 }}>
									<li>
										<label>
											<input type="checkbox" /> Ask participant to sign the SPFB sheet
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Provide / ask to fill out badge
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Inform participant regarding sponsor booths &amp; ballroom
										</label>
									</li>
								</ul>
							)}

							{primaryRole === ParticipantRole.WorkshopLead && (
								<ul style={{ listStyle: "none", padding: 0 }}>
									<li>
										<label>
											<input type="checkbox" /> Check ID photo matches participant&apos;s face
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Ask participant to sign the SPFB sheet
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Provide / ask to fill out badge
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Inform participant regarding workshop schedule &amp; room
										</label>
									</li>
								</ul>
							)}

							{primaryRole === ParticipantRole.Volunteer && (
								<ul style={{ listStyle: "none", padding: 0 }}>
									<li>
										<label>
											<input type="checkbox" /> Check ID photo matches participant&apos;s face
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Ask participant to sign the SPFB sheet
										</label>
									</li>
									<li>
										<label>
											<input
												type="checkbox"
												defaultChecked={!!participant.is_added_to_discord}
												disabled={!!participant.is_added_to_discord}
											/>{" "}
											Joined Discord? If not, ask for check-in lead
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Provide / ask to fill out badge
										</label>
									</li>
								</ul>
							)}

							{(primaryRole === ParticipantRole.Guest || primaryRole === "General") && (
								<ul style={{ listStyle: "none", padding: 0 }}>
									<li>
										<label>
											<input type="checkbox" /> Ask participant to sign the SPFB sheet
										</label>
									</li>
									<li>
										<label>
											<input type="checkbox" /> Provide / ask to fill out badge
										</label>
									</li>
								</ul>
							)}

							<p style={{ marginTop: "1rem" }}>
								The schedule is available on the website at{" "}
								<Link external href="/schedule">
									Schedule
								</Link>
								.
							</p>
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
