import React, { useCallback, useMemo, useState } from "react";

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";

import BadgeScanner from "@/lib/admin/BadgeScanner";
import { Participant } from "@/lib/admin/useParticipants";

const MAX_SEARCH_MATCHES = 10;

interface SubeventCheckinProps {
	participants: Participant[];
	onConfirm: (participant: Participant) => Promise<boolean>;
}

function matchParticipant(p: Participant, query: string): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return false;
	const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
	return (
		p._id.toLowerCase().includes(q) ||
		p.first_name.toLowerCase().includes(q) ||
		p.last_name.toLowerCase().includes(q) ||
		fullName.includes(q)
	);
}

function SubeventCheckin({ participants, onConfirm }: SubeventCheckinProps) {
	const [scannedUid, setScannedUid] = useState("");
	const [participantSearch, setParticipantSearch] = useState("");
	const [showScanner, setShowScanner] = useState(true);
	const [error, setError] = useState("");

	const onScanSuccess = useCallback((decodedText: string) => {
		setScannedUid(decodedText.trim());
		setShowScanner(false);
		setParticipantSearch("");
	}, []);

	// QR code from portal encodes UID; match participant by _id
	const participant = participants.find((p) => p._id === scannedUid);

	const searchMatches = useMemo(() => {
		if (!participantSearch.trim()) return [];
		return participants
			.filter((p) => matchParticipant(p, participantSearch))
			.slice(0, MAX_SEARCH_MATCHES);
	}, [participants, participantSearch]);

	const selectParticipant = useCallback((p: Participant) => {
		setScannedUid(p._id);
		setParticipantSearch("");
		setShowScanner(false);
	}, []);

	const notFoundMessage = (
		<p>
			Participant could not be found. Scan the participant&apos;s portal QR
			code or enter their UID manually.
		</p>
	);

	const badgeScanner = useMemo(
		() => <BadgeScanner onSuccess={onScanSuccess} onError={() => null} />,
		[onScanSuccess],
	);

	const handleConfirm = async () => {
		if (!participant) return;
		setError("");
		const okay = await onConfirm(participant);
		if (okay) {
			setScannedUid("");
		} else {
			setError("Check-in failed");
		}
	};

	return (
		<Container>
			<SpaceBetween size="m">
				<Input
					value={participantSearch}
					onChange={({ detail }) => setParticipantSearch(detail.value)}
					placeholder="Search participants by name or UID"
					type="search"
					clearAriaLabel="Clear search"
				/>
				{searchMatches.length > 0 && (
					<ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
						{searchMatches.map((p) => (
							<li key={p._id} style={{ marginBottom: "0.25rem" }}>
								<Button
									variant="link"
									onClick={() => selectParticipant(p)}
									ariaLabel={`Select ${p.first_name} ${p.last_name}`}
								>
									{p.first_name} {p.last_name} ({p._id})
								</Button>
							</li>
						))}
					</ul>
				)}
				<SpaceBetween direction="horizontal" size="xs">
					<Input
						onChange={({ detail }) => setScannedUid(detail.value)}
						value={scannedUid}
						placeholder="Scan QR or enter UID"
					/>
					<Button
						iconName="video-on"
						variant="icon"
						onClick={() => setShowScanner(true)}
						iconAlt="Scan with camera"
					/>
				</SpaceBetween>
			</SpaceBetween>
			{showScanner && badgeScanner}
			{scannedUid !== "" && !participant && notFoundMessage}
			{participant && (
				<p>
					Participant: {`${participant.first_name} ${participant.last_name}`}
				</p>
			)}
			{error && <p style={{ color: "var(--color-text-error)" }}>{error}</p>}
			<Button onClick={handleConfirm} disabled={!participant}>
				Confirm check-in
			</Button>
		</Container>
	);
}

export default SubeventCheckin;
