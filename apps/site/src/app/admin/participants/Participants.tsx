"use client";

import { useState } from "react";

import useParticipants, { Participant } from "@/lib/admin/useParticipants";

import CheckInModal from "./components/CheckInModal";
import ParticipantsTable from "./components/ParticipantsTable";

function Participants() {
	const { participants, loading, checkInParticipant } = useParticipants();
	const [currentParticipant, setCurrentParticipant] =
		useState<Participant | null>(null);

	const initiateCheckIn = (participant: Participant): void => {
		setCurrentParticipant(participant);
	};

	const sendCheckIn = async (participant: Participant): Promise<void> => {
		await checkInParticipant(participant);
		setCurrentParticipant(null);
		// TODO: Flashbar notification
	};

	return (
		<>
			<ParticipantsTable
				participants={participants}
				loading={loading}
				initiateCheckIn={initiateCheckIn}
			/>
			<CheckInModal
				onDismiss={() => setCurrentParticipant(null)}
				onConfirm={sendCheckIn}
				participant={currentParticipant}
			/>
			{/* TODO: walk-in promotion modal */}
		</>
	);
}

export default Participants;
