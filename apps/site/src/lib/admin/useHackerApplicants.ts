import axios from "axios";
import useSWR from "swr";

import { Decision, Status } from "./useApplicant";

export interface HackerApplicantSummary {
	_id: string;
	first_name: string;
	last_name: string;
	status: Status;
	decision: Decision | null;
	num_reviewers: number;
	avg_score: number;
	application_data: {
		school: string;
		submission_time: string;
	};
}

const fetcher = async (url: string) => {
	const res = await axios.get<HackerApplicantSummary[]>(url);
	return res.data;
};

function useHackerApplicants() {
	const { data, error, isLoading } = useSWR<HackerApplicantSummary[]>(
		"/api/admin/hackerApplicants",
		fetcher,
	);

	return { applicantList: data || [], loading: isLoading, error };
}

export default useHackerApplicants;
