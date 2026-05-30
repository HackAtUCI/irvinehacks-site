import useSWR from "swr";
import axios from "axios";

export interface ScheduleTemplate {
	template_name: string;
	template_info: {
		event_dates: string[];
		shifts: unknown[];
		org_availabilities: Record<string, string[]>;
	};
	drafts: Draft[];
}

export interface Draft {
	draft_name: string;
	draft_info: {
		minimum_pts: number;
	};
}

const fetcher = (url: string) =>
	axios.get<ScheduleTemplate[]>(url).then((r) => r.data);

export default function useTemplates() {
	const { data, isLoading, mutate } = useSWR<ScheduleTemplate[]>(
		"/api/director/templates",
		fetcher,
	);

	return {
		templateList: (data ?? []).map((template) => ({
			_id: template.template_name,
			name: template.template_name,
			startDate: template.template_info?.event_dates?.[0] ?? "",
			endDate:
				template.template_info?.event_dates?.[1] ??
				template.template_info?.event_dates?.[0] ??
				"",
			isPublished: false,
		})),
		loading: isLoading,
		mutate,
	};
}
