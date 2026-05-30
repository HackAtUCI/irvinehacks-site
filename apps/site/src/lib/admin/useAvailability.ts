import axios from "axios";
import useSWR from "swr";

export interface AvailabilitySlot {
	date: string;
	start_time: string;
}

export interface AvailabilityResponse {
	availability: AvailabilitySlot[];
	template_name: string | null;
	submitted_at: string | null;
	updated_at: string | null;
}

const AVAILABILITY_ROUTE = "/api/availability";

const fetcher = async (url: string) => {
	const res = await axios.get<AvailabilityResponse>(url);
	return res.data;
};

function useAvailability() {
	const { data, error, isLoading, mutate } = useSWR<AvailabilityResponse>(
		AVAILABILITY_ROUTE,
		fetcher,
	);

	const submitAvailability = async (availability: AvailabilitySlot[]) => {
		const res = await axios.put<AvailabilityResponse>(AVAILABILITY_ROUTE, {
			availability,
		});
		await mutate(res.data, false);
		return res.data;
	};

	return {
		availability: data?.availability ?? [],
		templateName: data?.template_name ?? null,
		submittedAt: data?.submitted_at ?? null,
		updatedAt: data?.updated_at ?? null,
		loading: isLoading,
		error,
		mutate,
		submitAvailability,
	};
}

export default useAvailability;
