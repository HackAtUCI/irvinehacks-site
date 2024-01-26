import axios from "axios";
import useSWR from "swr";

import { Status, Uid } from "@/lib/admin/useApplicant";

const enum Role {
	Director = "director",
	Organizer = "organizer",
	CheckInLead = "checkin_lead",
	Applicant = "applicant",
	Mentor = "mentor",
	Volunteer = "volunteer",
	Sponsor = "sponsor",
	Judge = "judge",
	WorkshopLead = "workshop_lead",
}

export interface Participant {
	_id: Uid;
	first_name: string;
	last_name: string;
	role: Role;
	status: Status;
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
		console.log("Checking in", participant);
		// TODO: implement mutation for showing checked in on each day
		await axios.post(`/api/admin/checkin/${participant._id}`);
		mutate();
	};

	const releaseParticipantFromWaitlist = async (participant: Participant) => {
		console.log(`Promoted to waitlist`, participant);
		// TODO: implement mutation for showing checked in on each day
		await axios.post(`/api/admin/waitlist-release/${participant._id}`);
		mutate();
	};

	const confirmNonHacker = async (participant: Participant) => {
		console.log("Confirmed attendance for non-hacker", participant);
		await axios.post(`/api/admin/update-attendance/${participant._id}`);
		mutate();
	};

	return {
		participants: data ?? [],
		loading: isLoading,
		error,
		checkInParticipant,
		releaseParticipantFromWaitlist,
		confirmNonHacker,
	};
}

export default useParticipants;
