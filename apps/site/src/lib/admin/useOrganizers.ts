import axios from "axios";
import useSWR from "swr";

export interface Organizer {
	_id: string;
	first_name: string;
	last_name: string;
	roles: ReadonlyArray<string>;
	committees: ReadonlyArray<string>;
	hacker_review_count: number;
}

const fetcher = async (url: string) => {
	const res = await axios.get<Organizer[]>(url);
	return res.data;
};

function useOrganizers() {
	const { data, error, isLoading, mutate } = useSWR<Organizer[]>(
		"/api/admin/organizers",
		fetcher,
	);

	return { organizerList: data || [], loading: isLoading, error, mutate };
}

export default useOrganizers;
