import axios from "axios";
import useSWR from "swr";

export interface ReviewAssignmentSettings {
	minimum_reviews_per_organizer: number | null;
	maximum_reviews_per_organizer: number | null;
}

const REVIEW_ASSIGNMENT_SETTINGS_ROUTE =
	"/api/admin/review-assignment-settings";

const fetcher = async (url: string) => {
	const res = await axios.get<ReviewAssignmentSettings>(url);
	return res.data;
};

function useReviewAssignmentSettings() {
	const { data, error, isLoading, mutate } = useSWR<ReviewAssignmentSettings>(
		REVIEW_ASSIGNMENT_SETTINGS_ROUTE,
		fetcher,
	);

	const updateSettings = async (settings: ReviewAssignmentSettings) => {
		const res = await axios.post<ReviewAssignmentSettings>(
			"/api/director/review-assignment-settings",
			settings,
		);
		mutate(res.data, { revalidate: false });
		return res.data;
	};

	return {
		settings: data,
		loading: isLoading,
		error,
		updateSettings,
	};
}

export default useReviewAssignmentSettings;
