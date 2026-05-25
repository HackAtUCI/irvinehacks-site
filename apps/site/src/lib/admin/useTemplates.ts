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
	const { data, isLoading, mutate } = useSWR<any[]>(
		"/api/director/templates",
		fetcher,
	);

	return {
		templateList: (data ?? []).map((template) => ({
			_id: template.template_name,
			name: template.template_name,
			startDate:
				template.template_info?.event_dates?.[0] ?? template.event_start ?? "",
			endDate:
				template.template_info?.event_dates?.[1] ??
				template.event_end ??
				template.template_info?.event_dates?.[0] ??
				"",
			isPublished: false,
		})),
		loading: isLoading,
		mutate,
	};
}
