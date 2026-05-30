import useSWR from "swr";
import axios from "axios";
import type { Shift } from "../../../src/app/admin/directors/template-management/[templateName]/ShiftTypes";

export interface ScheduleTemplateAPI {
	template_name: string;
	template_info: {
		event_dates: string[];
		shifts: Shift[];
		org_availabilities: Record<string, string[]>;
	};
	drafts: Draft[];
}

export interface Template {
	_id: string;
	name: string;
	startDate: string;
	endDate: string;
	isPublished: boolean;
}

export interface Draft {
	draft_name: string;
	draft_info: {
		minimum_pts: number;
	};
}
const fetcher = (url: string) => axios.get(url).then((r) => r.data);

export default function useTemplates() {
	const { data, isLoading, mutate } = useSWR<ScheduleTemplateAPI[]>(
		"/api/director/templates",
		fetcher,
	);

	return {
		templateList: (data ?? []).map((template) => ({
			_id: template.template_name,
			name: template.template_name,
			startDate: template.template_info?.event_dates?.[0] ?? "",
			endDate: template.template_info?.event_dates?.[1] ?? "",
			isPublished: false,
		})),
		loading: isLoading,
		mutate,
	};
}
