import axios from "axios";
import useSWR from "swr";

export interface ScoreThresholds {
	_id: string;
	accept: number;
	waitlist: number;
}

const fetcher = async (url: string) => {
	const res = await axios.get<ScoreThresholds>(url);
	return res.data;
};

function useHackerThresholds() {
	const { data, error, isLoading } = useSWR<ScoreThresholds>(
		"/api/admin/get-thresholds",
		fetcher,
	);

	return { thresholds: data, loading: isLoading, error };
}

export default useHackerThresholds;
