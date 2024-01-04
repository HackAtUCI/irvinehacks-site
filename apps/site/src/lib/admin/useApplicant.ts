import axios from "axios";
import useSWR from "swr";

export type uid = string;

export enum Decision {
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	waitlisted = "WAITLISTED",
}

export type Review = [string, uid, Decision];

// The application responses submitted by an applicant
export interface ApplicationData {
	first_name: string;
	last_name: string;
	email: string;
	gender: string;
	pronouns: string[];
	ethnicity: string;
	is_18_older: boolean;
	university: string;
	education_level: string;
	major: string;
	is_first_hackathon: boolean;
	portfolio_link: string | null;
	linkedin_link: string | null;
	stress_relief_question: string;
	company_specialize_question: string;
	resume_url: string;
	submission_time: string;
	reviews: Review[];
}

export type ApplicationQuestion = Exclude<keyof ApplicationData, "reviews">;

export enum ReviewStatus {
	pending = "PENDING_REVIEW",
	reviewed = "REVIEWED",
	released = "RELEASED",
}

export const Status = { ...ReviewStatus, ...Decision };
export type Status = ReviewStatus | Decision;

export interface Applicant {
	_id: uid;
	role: string;
	status: Status;
	application_data: ApplicationData;
}

const fetcher = async ([api, uid]: string[]) => {
	if (!uid) {
		return null;
	}
	const res = await axios.get<Applicant>(api + uid);
	return res.data;
};

function useApplicant(uid: uid) {
	const { data, error, isLoading, mutate } = useSWR<Applicant | null>(
		["/api/admin/applicant/", uid],
		fetcher
	);

	async function submitReview(uid: uid, review: Decision) {
		await axios.post("/api/admin/review", { applicant: uid, decision: review });
		// TODO: provide success status to display in alert
		mutate();
	}

	return { applicant: data, loading: isLoading, error, submitReview };
}

export type submitReview = (uid: uid, review: Decision) => Promise<void>;

export default useApplicant;
