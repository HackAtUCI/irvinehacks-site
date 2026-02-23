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

function useEvents() {
	const { data, error, isLoading } = useSWR<Event[]>(
		"/api/admin/events",
		fetcher,
	);

	const checkInParticipantSubevent = async (
		event: string,
		uid: string,
	): Promise<boolean> => {
		const res = await axios.post(
			`/api/admin/event-checkin/${event}`,
			JSON.stringify(uid),
			{ headers: { "Content-Type": "application/json" } },
		);
		return res.status === 200;
	};

	return {
		events: data || [],
		loading: isLoading,
		error,
		checkInParticipantSubevent,
	};
}

export default useEvents;
