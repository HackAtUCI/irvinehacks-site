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
	const { data, error, isLoading } = useSWR<Participant[]>(
		"/api/admin/participants",
		fetcher,
	);

	// TODO: implement check-in mutation
	return { participants: data ?? [], loading: isLoading, error };
}

export default useParticipants;
