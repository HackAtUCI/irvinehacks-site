import axios from "axios";
import useSWR from "swr";

import { Status, ParticipantRole } from "@/lib/userRecord";

export type GroupBy = "school" | "major" | "year";

type ApplicantTable = Record<string, number>;

interface UseApplicantTableOptions {
	role?: ParticipantRole | null;
	status?: Status | null;
	category: GroupBy | null;
	pronouns?: string | null;
	ethnicity?: string | null;
}

const fetcher = async (url: string) => {
	const res = await axios.get<ApplicantTable>(url);
	return res.data;
};

function useApplicantTable(options: UseApplicantTableOptions) {
	const { role, status, category, pronouns, ethnicity } = options;
	const params = new URLSearchParams();

	if (category) params.set("group_by", category);
	if (role) params.append("role", role);
	if (status) params.append("status_filter", status);
	if (pronouns) params.append("pronouns", pronouns);
	if (ethnicity) params.append("ethnicity", ethnicity);

	const queryString = params.toString();
	const url = `/api/admin/summary/applicants/table${
		queryString ? `?${queryString}` : ""
	}`;

	const { data, error, isLoading } = useSWR<ApplicantTable>(
		category ? url : null,
		fetcher,
	);

	return {
		table: data ?? ({} as ApplicantTable),
		loading: isLoading,
		error,
	};
}

export default useApplicantTable;
