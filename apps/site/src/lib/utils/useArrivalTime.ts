import axios from "axios";
import useSWR from "swr";

export interface ArrivalTimeResponse {
	arrival_time: string | null;
}

const fetcher = async (url: string) => {
	const res = await axios.get<ArrivalTimeResponse>(url);
	return res.data;
};

function useArrivalTime() {
	const { data } = useSWR<ArrivalTimeResponse>(
		"/api/user/rsvp/late-arrival",
		fetcher,
	);

	return data;
}

export default useArrivalTime;
