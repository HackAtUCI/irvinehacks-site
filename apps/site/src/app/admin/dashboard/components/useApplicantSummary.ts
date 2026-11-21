import axios from "axios";
import useSWR from "swr";

import { Decision, Status, ParticipantRole } from "@/lib/userRecord";

type ApplicantSummary = Partial<Record<Status, number>>;

interface UseApplicantSummaryOptions {
	role?: ParticipantRole | null;
	status?: Status | null;
	decision?: Decision | null;
}

const fetcher = async (url: string) => {
	const res = await axios.get<ApplicantSummary>(url);
	return res.data;
};

function useApplicantSummary(options: UseApplicantSummaryOptions = {}) {
	const { role, status, decision } = options;

	// Build URL with query parameters
	const params = new URLSearchParams();
	if (role) params.append("role", role);
	if (status) params.append("status_filter", status);
	if (decision) params.append("decision", decision);

	const queryString = params.toString();
	const url = `/api/admin/summary/applicants${
		queryString ? `?${queryString}` : ""
	}`;

	const { data, error, isLoading, mutate } = useSWR<ApplicantSummary>(
		url,
		fetcher,
	);

	return {
		summary: data ?? ({} as ApplicantSummary),
		loading: isLoading,
		error,
		mutate,
	};
}

export default useApplicantSummary;
