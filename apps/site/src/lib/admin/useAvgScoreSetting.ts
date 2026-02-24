import axios from "axios";
import useSWR from "swr";

export interface AvgScoreSetting {
	show_with_one_reviewer: boolean;
}

const fetcher = async (url: string) => {
	const res = await axios.get<AvgScoreSetting>(url);
	return res.data;
};

function useAvgScoreSetting() {
	const { data, error, isLoading, mutate } = useSWR<AvgScoreSetting>(
		"/api/admin/avg-score-setting",
		fetcher,
	);

	return {
		showWithOneReviewer: data?.show_with_one_reviewer ?? false,
		loading: isLoading,
		error,
		mutate,
	};
}

export default useAvgScoreSetting;
