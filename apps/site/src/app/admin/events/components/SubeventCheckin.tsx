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
	const [badgeNumber, setBadgeNumber] = useState("");
	const [showScanner, setShowScanner] = useState(true);
	const [error, setError] = useState("");

	const onScanSuccess = useCallback((decodedText: string) => {
		console.log("Scanner found");
		setBadgeNumber(decodedText);
		setShowScanner(false);
	}, []);

	const participant = participants.filter(
		(participant) => participant.badge_number === badgeNumber,
	)[0];
	const notFoundMessage = (
		<p>
			Participant could not be found, please note down the name of the
			participant manually
		</p>
	);

	const badgeScanner = useMemo(
		() => <BadgeScanner onSuccess={onScanSuccess} onError={() => null} />,
		[onScanSuccess],
	);

	const handleConfirm = async () => {
		const okay = await onConfirm(participant);
		if (okay) {
			console.log("clearing badge number");
			setBadgeNumber("");
			setError("");
		} else {
			setError("checkin failed");
		}
	};

	return (
		<Container>
			<SpaceBetween direction="horizontal" size="xs">
				<Input
					onChange={({ detail }) => setBadgeNumber(detail.value)}
					value={badgeNumber}
				/>
				<Button
					iconName="video-on"
					variant="icon"
					onClick={() => setShowScanner(true)}
					iconAlt="Scan with camera"
				/>
			</SpaceBetween>
			{showScanner && badgeScanner}
			{badgeNumber !== "" && !participant && notFoundMessage}
			{participant && (
				<p>
					Participant: {`${participant.first_name} ${participant.last_name}`}
				</p>
			)}
			{error}
			<Button onClick={handleConfirm}>Confirm</Button>
		</Container>
	);
}

export default SubeventCheckin;
