import axios from "axios";
import useSWR from "swr";

export interface Event {
	name: string;
	_id: string;
	checkins?: Record<string, string> | [string, string][];
}

const fetcher = async (url: string) => {
	const res = await axios.get<Event[]>(url);
	return res.data;
};

const EVENTS_ROUTE = "/api/admin/events";

function useEvents() {
	const { data, error, isLoading, mutate } = useSWR<Event[]>(
		EVENTS_ROUTE,
		fetcher,
	);

	const checkInParticipantSubevent = async (
		event: string,
		uid: string,
	): Promise<boolean> => {
		try {
			const res = await axios.post(
				`/api/admin/event-checkin/${event}`,
				JSON.stringify(uid),
				{ headers: { "Content-Type": "application/json" } },
			);
			if (res.status === 200) {
				await mutate();
			}
			return res.status === 200;
		} catch (err) {
			const msg =
				axios.isAxiosError(err) && err.response?.data?.detail !== undefined
					? String(err.response.data.detail)
					: "Check-in failed";
			throw new Error(msg);
		}
	};

	return {
		events: data || [],
		loading: isLoading,
		error,
		checkInParticipantSubevent,
	};
}

export default useEvents;
