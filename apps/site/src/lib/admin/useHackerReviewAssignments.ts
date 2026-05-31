import axios from "axios";
import useSWR from "swr";

interface HackerReviewAssignmentsResponse {
	applicant_ids: string[];
	target_count: number;
}

const HACKER_REVIEW_ASSIGNMENTS_ROUTE = "/api/admin/review-assignments/hackers";

const fetcher = async (url: string) => {
	const res = await axios.get<HackerReviewAssignmentsResponse>(url);
	return res.data;
};

function useHackerReviewAssignments(enabled = true) {
	const { data, error, isLoading, mutate } =
		useSWR<HackerReviewAssignmentsResponse>(
			enabled ? HACKER_REVIEW_ASSIGNMENTS_ROUTE : null,
			fetcher,
		);

	return {
		assignedApplicantIds: data?.applicant_ids ?? [],
		targetCount: data?.target_count ?? 0,
		loading: enabled && isLoading,
		error,
		mutate,
	};
}

export default useHackerReviewAssignments;
