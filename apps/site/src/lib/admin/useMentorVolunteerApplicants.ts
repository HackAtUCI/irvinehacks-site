import axios from "axios";
import useSWR from "swr";

import { Decision, Status } from "@/lib/userRecord";

export interface ApplicantSummary {
	_id: string;
	first_name: string;
	last_name: string;
	status: Status;
	decision: Decision | null;
	application_data: {
		school: string;
		submission_time: string;
	};
}

const fetcher = async ([url, applicationType]: [string, string]) => {
	const res = await axios.get<ApplicantSummary[]>(url + applicationType);
	return res.data;
};

function useMentorVolunteerApplicants(applicationType: "mentor" | "volunteer") {
	const { data, error, isLoading } = useSWR<
		ApplicantSummary[],
		unknown,
		[string, string]
	>(["/api/admin/applicants/", applicationType], fetcher);

	return { applicantList: data || [], loading: isLoading, error };
}

export default useMentorVolunteerApplicants;
