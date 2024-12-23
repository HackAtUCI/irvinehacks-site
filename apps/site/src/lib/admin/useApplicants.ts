import axios from "axios";
import useSWR from "swr";

import { Status } from "./useApplicant";

export interface ApplicantSummary {
	_id: string;
	first_name: string;
	last_name: string;
	status: Status;
	decision: Status | null;
	application_data: {
		school: string;
		submission_time: string;
	};
}

const fetcher = async (url: string) => {
	const res = await axios.get<ApplicantSummary[]>(url);
	return res.data;
};

function useApplicants() {
	const { data, error, isLoading } = useSWR<ApplicantSummary[]>(
		"/api/admin/applicants",
		fetcher,
	);

	return { applicantList: data || [], loading: isLoading, error };
}

export default useApplicants;
