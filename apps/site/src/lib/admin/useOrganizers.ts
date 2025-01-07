import axios from "axios";
import useSWR from "swr";

export interface Organizer {
	_id: string;
	first_name: string;
	last_name: string;
	roles: ReadonlyArray<string>;
}

const fetcher = async (url: string) => {
	const res = await axios.get<Organizer[]>(url);
	return res.data;
};

function useOrganizers() {
	const { data, error, isLoading } = useSWR<Organizer[]>(
		"/api/director/organizers",
		fetcher,
	);

	return { organizerList: data || [], loading: isLoading, error };
}

export default useOrganizers;
