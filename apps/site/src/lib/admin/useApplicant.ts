import axios from "axios";
import useSWR from "swr";

export type Uid = string;
export type Score = number;

export enum Decision {
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	waitlisted = "WAITLISTED",
}

export type Review = [string, Uid, Decision];
export type HackerReview = [string, Score];

// The application responses submitted by an applicant
export interface ApplicationData {
	email: string;
	pronouns: string[];
	ethnicity: string;
	is_18_older: boolean;
	school: string;
	education_level: string;
	major: string;
	is_first_hackathon: boolean;
	portfolio: string | null;
	linkedin: string | null;
	frq_collaboration: string;
	frq_dream_job: string;
	resume_url: string;
	submission_time: string;
	reviews: Review[];
	hacker_reviews: Record<string, HackerReview[]>;
}

export type ApplicationQuestion = Exclude<keyof ApplicationData, "reviews">;

export enum ReviewStatus {
	pending = "PENDING_REVIEW",
	reviewed = "REVIEWED",
	released = "RELEASED",
}

export enum PostAcceptedStatus {
	signed = "WAIVER_SIGNED",
	confirmed = "CONFIRMED",
	attending = "ATTENDING",
	void = "VOID",
}

export const Status = { ...ReviewStatus, ...Decision, ...PostAcceptedStatus };
export type Status = ReviewStatus | Decision | PostAcceptedStatus;

export interface Applicant {
	_id: Uid;
	first_name: string;
	last_name: string;
	roles: ReadonlyArray<string>;
	status: Status;
	application_data: ApplicationData;
}

const fetcher = async ([api, uid]: [string, Uid]) => {
	if (!uid) {
		return null;
	}
	const res = await axios.get<Applicant>(api + uid);
	return res.data;
};

function useApplicant(uid: Uid) {
	const { data, error, isLoading, mutate } = useSWR<
		Applicant | null,
		unknown,
		[string, Uid]
	>(["/api/admin/applicant/", uid], fetcher);

	async function submitReview(uid: Uid, review: Decision) {
		await axios.post("/api/admin/review", { applicant: uid, decision: review });
		// TODO: provide success status to display in alert
		mutate();
	}

	async function submitHackerReview(uid: Uid, score: string) {
		await axios.post("/api/admin/hackerReview", {
			applicant: uid,
			score: score,
		});
		// TODO: provide success status to display in alert
		mutate();
	}

	return {
		applicant: data,
		loading: isLoading,
		error,
		submitReview,
		submitHackerReview,
	};
}

export type submitReview = (uid: Uid, review: Decision) => Promise<void>;
export type submitHackerReview = (uid: Uid, score: string) => Promise<void>;

export default useApplicant;
