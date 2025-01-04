import axios from "axios";
import useSWR from "swr";

interface ApplicationStats {
	[key: string]: {
		[key: string]: number;
	};
}

const fetcher = async (url: string) => {
	const res = await axios.get<ApplicationStats>(url);
	return res.data;
};

function useApplicationsSummary(groupBy: "school" | "role") {
	const { data, error, isLoading } = useSWR<ApplicationStats>(
		`/api/admin/summary/applications?group_by=${groupBy}`,
		fetcher,
	);

	return { applications: data ?? {}, loading: isLoading, error };
}

export default useApplicationsSummary;
