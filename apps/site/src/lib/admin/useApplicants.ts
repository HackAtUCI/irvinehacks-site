import axios from "axios";
import useSWR from "swr";

import { Status } from "./useApplicant";

export interface ApplicantSummary {
	_id: string;
	status: Status;
	decision: Status | null;
	application_data: {
		first_name: string;
		last_name: string;
		university: string;
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
		fetcher
	);

	return { applicantList: data || [], loading: isLoading, error };
}

export default useApplicants;
