import axios from "axios";
import useSWR from "swr";

interface AvailabilityLockResponse {
	locked: boolean;
}

const AVAILABILITY_LOCK_ROUTE = "/api/availability/lock";

const fetcher = async (url: string) => {
	const res = await axios.get<AvailabilityLockResponse>(url);
	return res.data;
};

function useAvailabilityLock() {
	const { data, error, isLoading, mutate } = useSWR<AvailabilityLockResponse>(
		AVAILABILITY_LOCK_ROUTE,
		fetcher,
	);

	const setLocked = async (locked: boolean) => {
		const res = await axios.post<AvailabilityLockResponse>(
			AVAILABILITY_LOCK_ROUTE,
			{ locked },
		);
		await mutate(res.data, false);
		return res.data.locked;
	};

	return {
		isLocked: data?.locked ?? false,
		loading: isLoading,
		error,
		mutate,
		setLocked,
	};
}

export default useAvailabilityLock;
