import axios from "axios";
import useSWR from "swr";

import { Status } from "@/lib/admin/useApplicant";

type ApplicantSummary = Partial<Record<Status, number>>;

const fetcher = async (url: string) => {
	const res = await axios.get<ApplicantSummary>(url);
	return res.data;
};

function useApplicantSummary() {
	const { data, error, isLoading } = useSWR<ApplicantSummary>(
		"/api/admin/summary/applicants",
		fetcher,
	);

	return {
		summary: data ?? ({} as ApplicantSummary),
		loading: isLoading,
		error,
	};
}

export default useApplicantSummary;
