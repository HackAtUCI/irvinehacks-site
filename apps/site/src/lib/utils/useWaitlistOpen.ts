import axios from "axios";
import useSWR from "swr";

interface WaitlistStatus {
	is_started: boolean;
	is_open: boolean;
}

const fetcher = async (url: string) => {
	const res = await axios.get<WaitlistStatus>(url);
	return res.data;
};

function useWaitlistOpen() {
	const { data, error } = useSWR<WaitlistStatus>(
		"/api/user/waitlist-open",
		fetcher,
	);

	return {
		waitlistStatus: data,
		isLoading: data === undefined && !error,
		error,
	};
}

export default useWaitlistOpen;
