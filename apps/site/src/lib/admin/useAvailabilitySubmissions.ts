import axios from "axios";
import useSWR from "swr";

const AVAILABILITY_SUBMISSIONS_ROUTE = "/api/availability/submissions";

const fetcher = async (url: string) => {
	const res = await axios.get<string[]>(url);
	return res.data;
};

function useAvailabilitySubmissions() {
	const { data, error, isLoading, mutate } = useSWR<string[]>(
		AVAILABILITY_SUBMISSIONS_ROUTE,
		fetcher,
	);

	return {
		submittedOrganizerIds: data ?? [],
		loading: isLoading,
		error,
		mutate,
	};
}

export default useAvailabilitySubmissions;
