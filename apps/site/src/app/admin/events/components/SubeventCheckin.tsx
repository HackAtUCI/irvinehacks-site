import React, { useCallback, useMemo, useState } from "react";

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";

import BadgeScanner from "@/lib/admin/BadgeScanner";
import { Participant } from "@/lib/admin/useParticipants";

interface SubeventCheckinProps {
	participants: Participant[];
	onConfirm: (participant: Participant) => Promise<boolean>;
}

function SubeventCheckin({ participants, onConfirm }: SubeventCheckinProps) {
	const [scannedUid, setScannedUid] = useState("");
	const [showScanner, setShowScanner] = useState(true);
	const [error, setError] = useState("");

	const onScanSuccess = useCallback((decodedText: string) => {
		setScannedUid(decodedText.trim());
		setShowScanner(false);
	}, []);

	// QR code from portal encodes UID; match participant by _id
	const participant = participants.find((p) => p._id === scannedUid);
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
