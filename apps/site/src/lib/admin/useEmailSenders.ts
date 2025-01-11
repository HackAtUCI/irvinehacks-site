import axios from "axios";
import useSWR from "swr";
import { Uid } from "../userRecord";

export type Sender = [string, Uid, number];

export interface Senders {
	senders: ReadonlyArray<Sender>;
}

const fetcher = async (url: string) => {
	const res = await axios.get<Senders[]>(url);
	return res.data;
};

function useEmailSenders() {
	const { data, error, isLoading } = useSWR<Senders[]>(
		"/api/director/apply-reminder",
		fetcher,
	);

	return {
		senders: data || [],
		loading: isLoading,
		error,
	};
}

export default useEmailSenders;
