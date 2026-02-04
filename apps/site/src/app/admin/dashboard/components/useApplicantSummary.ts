import axios from "axios";
import useSWR from "swr";

import { Status, ParticipantRole } from "@/lib/userRecord";

type ApplicantSummary = Partial<Record<Status, number>>;

interface UseApplicantSummaryOptions {
	role?: ParticipantRole | null;
	status?: Status | null;
}

const fetcher = async (url: string) => {
	const res = await axios.get<ApplicantSummary>(url);
	return res.data;
};

function useApplicantSummary(options: UseApplicantSummaryOptions = {}) {
	const { role, status } = options;

	// Build URL with query parameters
	const params = new URLSearchParams();
	if (role) params.append("role", role);
	if (status) params.append("status_filter", status);

	const queryString = params.toString();
	const url = `/api/admin/summary/applicants${
		queryString ? `?${queryString}` : ""
	}`;

	const { data, error, isLoading } = useSWR<ApplicantSummary>(url, fetcher);

	return {
		summary: data ?? ({} as ApplicantSummary),
		loading: isLoading,
		error,
	};
}

export default useApplicantSummary;
