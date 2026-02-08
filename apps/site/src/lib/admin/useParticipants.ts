import axios from "axios";
import useSWR from "swr";

import { Decision, ParticipantRole, Status, Uid } from "@/lib/userRecord";

export type Checkin = [string, Uid];

export interface Participant {
	_id: Uid;
	first_name: string;
	last_name: string;
	roles: ReadonlyArray<ParticipantRole>;
	checkins: Checkin[];
	status: Status;
	decision?: Decision;
	badge_number: string | null;
}

const fetcher = async (url: string) => {
	const res = await axios.get<Participant[]>(url);
	return res.data;
};

function useParticipants() {
	const { data, error, isLoading, mutate } = useSWR<Participant[]>(
		"/api/admin/participants",
		fetcher,
	);

	const checkInParticipant = async (participant: Participant) => {
		try {
			console.log("Checking in", participant);
			// TODO: implement mutation for showing checked in on each day
			// Note: Will cause 422 if badge number is null, but in practice,
			// this should never happen
			await axios.post(`/api/admin/checkin/${participant._id}`);
			mutate();
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.data?.detail) {
				throw new Error(error.response.data.detail);
			}
			throw error;
		}
	};

	const queueParticipant = async (participant: Participant) => {
		try {
			console.log("Queueing in", participant);
			await axios.post(`/api/admin/queue/${participant._id}`);
			mutate();
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.data?.detail) {
				throw new Error(error.response.data.detail);
			}
			throw error;
		}
	};

	const releaseParticipantFromWaitlist = async (participant: Participant) => {
		console.log(`Promoted to waitlist`, participant);
		// TODO: implement mutation for showing checked in on each day
		await axios.post(`/api/admin/waitlist-release/${participant._id}`);
		mutate();
	};

	const confirmOutsideParticipants = async (participant: Participant) => {
		console.log("Confirmed attendance for outside participants", participant);
		await axios.post(`/api/admin/update-attendance/${participant._id}`);
		mutate();
	};

	return {
		participants: data ?? [],
		loading: isLoading,
		error,
		checkInParticipant,
		queueParticipant,
		releaseParticipantFromWaitlist,
		confirmOutsideParticipants,
	};
}

export default useParticipants;
