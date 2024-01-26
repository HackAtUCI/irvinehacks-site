"use client";

import { useState } from "react";

import useParticipants, { Participant } from "@/lib/admin/useParticipants";

import CheckInModal from "./components/CheckInModal";
import ParticipantsTable from "./components/ParticipantsTable";
import WaitlistPromotionModal from "./components/WaitlistPromotionModal";

function Participants() {
	const {
		participants,
		loading,
		checkInParticipant,
		releaseParticipantFromWaitlist,
		confirmNonHacker,
	} = useParticipants();
	const [checkinParticipant, setCheckinParticipant] =
		useState<Participant | null>(null);
	const [promoteParticipant, setPromoteParticipant] =
		useState<Participant | null>(null);

	const initiateCheckIn = (participant: Participant): void => {
		setCheckinParticipant(participant);
	};

	const sendCheckIn = async (participant: Participant): Promise<void> => {
		await checkInParticipant(participant);
		setCheckinParticipant(null);
		// TODO: Flashbar notification
	};

	const initiatePromotion = (participant: Participant): void => {
		setPromoteParticipant(participant);
	};

	const sendWaitlistPromote = async (
		participant: Participant,
	): Promise<void> => {
		await releaseParticipantFromWaitlist(participant);
		setPromoteParticipant(null);
		// TODO: Flashbar notification
	};

	return (
		<>
			<ParticipantsTable
				participants={participants}
				loading={loading}
				initiateCheckIn={initiateCheckIn}
				initiatePromotion={initiatePromotion}
				initiateConfirm={confirmNonHacker}
			/>
			<CheckInModal
				onDismiss={() => setCheckinParticipant(null)}
				onConfirm={sendCheckIn}
				participant={checkinParticipant}
			/>
			<WaitlistPromotionModal
				onDismiss={() => setPromoteParticipant(null)}
				onConfirm={sendWaitlistPromote}
				participant={promoteParticipant}
			/>
		</>
	);
}

export default Participants;
