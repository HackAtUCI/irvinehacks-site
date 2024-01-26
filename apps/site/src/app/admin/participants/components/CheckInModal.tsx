import { useCallback, useEffect, useMemo, useState } from "react";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";

import BadgeScanner from "@/lib/admin/BadgeScanner";
import { Participant } from "@/lib/admin/useParticipants";

export interface ActionModalProps {
	onDismiss: () => void;
	onConfirm: (participant: Participant) => void;
	participant: Participant | null;
}

function CheckInModal({ onDismiss, onConfirm, participant }: ActionModalProps) {
	const [badgeNumber, setBadgeNumber] = useState(
		participant?.badge_number ?? "",
	);
	const [showScanner, setShowScanner] = useState(true);

	const onScanSuccess = useCallback((decodedText: string) => {
		setBadgeNumber(decodedText);
		setShowScanner(false);
	}, []);

	useEffect(() => {
		console.log("new participant", participant);
		setBadgeNumber(participant?.badge_number ?? "");
		setShowScanner(participant?.badge_number === null);
	}, [participant]);

	const badgeScanner = useMemo(
		() => <BadgeScanner onSuccess={onScanSuccess} onError={() => null} />,
		[onScanSuccess],
	);

	if (participant === null) {
		if (showScanner) {
			setShowScanner(false);
		}
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
						<Button
							variant="primary"
							onClick={() =>
								onConfirm({
									...participant,
									badge_number: badgeNumber,
								})
							}
						>
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
				{showScanner && badgeScanner}
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
			</SpaceBetween>
		</Modal>
	);
}

export default CheckInModal;
