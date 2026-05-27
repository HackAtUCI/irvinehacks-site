import axios from "axios";
import useSWR from "swr";

export interface LateArrivalRecord {
	id: string;
	first_name: string;
	last_name: string;
	arrival_time: string;
	late_arrival_reason: string | null;
	late_arrival_edit_request: string | null;
	late_arrival_edit_reason: string | null;
	status: string;
	decision: string | null;
}

const fetcher = async (url: string) => {
	const res = await axios.get<LateArrivalRecord[]>(url);
	return res.data;
};

function useLateArrivals() {
	const { data, error, isLoading, mutate } = useSWR<LateArrivalRecord[]>(
		"/api/checkin-leads/late-arrivals",
		fetcher,
		{ refreshInterval: 3000 },
	);

	return {
		lateArrivals: (data ?? []).sort((a, b) =>
			a.arrival_time.localeCompare(b.arrival_time),
		),
		loading: isLoading,
		error,
		mutate,
	};
}

export default useLateArrivals;
