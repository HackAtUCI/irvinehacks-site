import axios from "axios";
import useSWR from "swr";

import { Decision, Status } from "@/lib/userRecord";

export interface HackerApplicantSummary {
	_id: string;
	first_name: string;
	last_name: string;
	status: Status;
	decision: Decision | null;
	reviewers: ReadonlyArray<string>;
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
		"/api/admin/applicants/hackers",
		fetcher,
	);


	return { applicantList: data || [], loading: isLoading, error };
}

export default useHackerApplicants;
