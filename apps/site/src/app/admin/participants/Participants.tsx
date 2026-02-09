"use client";

import { useContext, useState } from "react";

import useParticipants, { Participant } from "@/lib/admin/useParticipants";
import NotificationContext from "@/lib/admin/NotificationContext";

import CheckInModal from "./components/CheckInModal";
import ParticipantsTable from "./components/ParticipantsTable";

function Participants() {
	const {
		participants,
		loading,
		checkInParticipant,
		queueParticipant,
		confirmOutsideParticipants,
	} = useParticipants();
	const [checkinParticipant, setCheckinParticipant] =
		useState<Participant | null>(null);

	const { setNotifications } = useContext(NotificationContext);

	const initiateCheckIn = (participant: Participant): void => {
		setCheckinParticipant(participant);
	};

	const sendCheckIn = async (
		participant: Participant,
		type: string,
	): Promise<void> => {
		try {
			if (type === "accepted") {
				await checkInParticipant(participant);
			} else if (type === "waitlisted") {
				await queueParticipant(participant);
			}
			setCheckinParticipant(null);
			if (setNotifications) {
				const message =
					type === "accepted"
						? `Successfully checked in ${participant.first_name} ${participant.last_name}`
						: `Successfully added ${participant.first_name} ${participant.last_name} to waitlist queue`;

				const notificationId = participant._id;

				const dismissSuccess = () =>
					setNotifications((notifications) =>
						notifications.filter(
							(notification) => notification.id !== notificationId,
						),
					);

				setNotifications((oldNotifications) => [
					{
						type: "success",
						content: `${message}!`,
						dismissible: true,
						dismissLabel: "Dismiss message",
						id: notificationId,
						onDismiss: dismissSuccess,
					},
					...oldNotifications,
				]);

				window.setTimeout(dismissSuccess, 5000);
			}
		} catch (error) {
			setCheckinParticipant(null);
			const errorMessage = error;
			const notificationId = participant._id;

			if (setNotifications) {
				const dismissError = () =>
					setNotifications((notifications) =>
						notifications.filter(
							(notification) => notification.id !== notificationId,
						),
					);

				setNotifications((oldNotifications) => [
					{
						type: "error",
						content: `${errorMessage}`,
						dismissible: true,
						dismissLabel: "Dismiss message",
						id: notificationId,
						onDismiss: dismissError,
					},
					...oldNotifications,
				]);

				window.setTimeout(dismissError, 5000);
			}
		}
	};

	return (
		<>
			<ParticipantsTable
				participants={participants}
				loading={loading}
				initiateCheckIn={initiateCheckIn}
				initiateConfirm={confirmOutsideParticipants}
			/>
			<CheckInModal
				onDismiss={() => setCheckinParticipant(null)}
				onConfirm={sendCheckIn}
				participant={checkinParticipant}
			/>
		</>
	);
}

export default Participants;
