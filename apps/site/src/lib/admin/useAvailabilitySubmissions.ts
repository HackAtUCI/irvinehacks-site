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

	const clearAvailability = async () => {
		await axios.delete("/api/availability");
		await mutate([], false);
	};

	return {
		submittedOrganizerIds: data ?? [],
		loading: isLoading,
		error,
		mutate,
		clearAvailability,
	};
}

export default useAvailabilitySubmissions;
