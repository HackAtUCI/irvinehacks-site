import axios from "axios";
import useSWR from "swr";
import { Uid } from "../userRecord";

export type Sender = [string, Uid, number];

const fetcher = async (url: string) => {
	const res = await axios.get<Sender[]>(url);
	return res.data;
};

function useEmailSenders() {
	const { data, error, isLoading, mutate } = useSWR<Sender[]>(
		"/api/director/apply-reminder",
		fetcher,
	);

	return {
		senders: data || [],
		loading: isLoading,
		error,
		mutate,
	};
}

export default useEmailSenders;
