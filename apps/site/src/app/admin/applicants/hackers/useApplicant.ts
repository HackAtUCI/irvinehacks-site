import axios from "axios";
import useSWR from "swr";

import { ParticipantRole, Status, Uid, Score } from "@/lib/userRecord";

export type Review = [string, Uid, Score];

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
}

export type ApplicationQuestion = Exclude<keyof ApplicationData, "reviews">;

export interface Applicant {
	_id: Uid;
	first_name: string;
	last_name: string;
	roles: ReadonlyArray<ParticipantRole>;
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

	async function submitReview(uid: Uid, score: string | number) {
		await axios.post("/api/admin/review", { applicant: uid, score: score });
		// TODO: provide success status to display in alert
		mutate();
	}

	return {
		applicant: data,
		loading: isLoading,
		error,
		submitReview,
	};
}

export type submitReview = (uid: Uid, score: string | number) => Promise<void>;

export default useApplicant;
