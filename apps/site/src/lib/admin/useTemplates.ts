import useSWR from "swr";
import axios from "axios";

export interface Template {
	_id: string;
	name: string;
	startDate: string;
	endDate: string;
	isPublished: boolean;
}

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

export default function useTemplates() {
	const { data, isLoading, mutate } = useSWR<Template[]>(
		"/api/director/templates",
		fetcher,
	);

	return {
		templateList: data ?? [],
		loading: isLoading,
		mutate,
	};
}
