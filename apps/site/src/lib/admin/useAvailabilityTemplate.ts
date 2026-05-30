import axios from "axios";
import useSWR from "swr";

export interface AvailabilityTemplateShift {
	shift_name: string;
	location: string;
	min_num_organizers: number;
	shift_pts: number;
	hour: {
		start_time: string;
		end_time: string;
		director_on_shift: string[];
	};
	committee_prereq?: string | null;
	subcommittee_prereq?: string | null;
	preassigned_orgs: string[];
}

export interface AvailabilityTemplateResponse {
	template_name: string | null;
	event_dates: string[];
	shifts: AvailabilityTemplateShift[];
}

const AVAILABILITY_TEMPLATE_ROUTE = "/api/availability/template";

const fetcher = async (url: string) => {
	const res = await axios.get<AvailabilityTemplateResponse>(url);
	return res.data;
};

function useAvailabilityTemplate() {
	const { data, error, isLoading, mutate } =
		useSWR<AvailabilityTemplateResponse>(AVAILABILITY_TEMPLATE_ROUTE, fetcher);

	const requestAvailabilityTemplate = async (templateName: string) => {
		const res = await axios.post<AvailabilityTemplateResponse>(
			AVAILABILITY_TEMPLATE_ROUTE,
			{ template_name: templateName },
		);
		await mutate(res.data, false);
		return res.data;
	};

	const resetAvailabilityTemplate = async () => {
		await axios.delete(AVAILABILITY_TEMPLATE_ROUTE);
		await mutate(
			{
				template_name: null,
				event_dates: [],
				shifts: [],
			},
			false,
		);
	};

	return {
		template: data ?? null,
		templateName: data?.template_name ?? null,
		loading: isLoading,
		error,
		mutate,
		requestAvailabilityTemplate,
		resetAvailabilityTemplate,
	};
}

export default useAvailabilityTemplate;
