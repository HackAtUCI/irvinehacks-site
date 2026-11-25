import { uidToPseudonym } from "@/lib/admin/anonymize";
import { HackerApplicantSummary } from "@/lib/admin/useHackerApplicants";
import {
	NOT_FULLY_REVIEWED_SCORE,
	OVERQUALIFIED_SCORE,
} from "@/lib/decisionScores";
import { Decision } from "@/lib/userRecord";

type Review = NonNullable<
	HackerApplicantSummary["application_data"]["reviews"]
>[number];

export interface ScoreRow {
	id: string;
	name: string;
	email: string;
	major: string;
	linkedin: string | null;
	resumeUrl: string | null;
	rawScore: number | null;
	normalizedScore: number | null;
	specialScoreLabel: string | null;
	decision: Decision | null;
	reviews: ReadonlyArray<Review>;
}

function getSpecialScoreLabel(applicant: HackerApplicantSummary) {
	if (
		applicant.is_overqualified ||
		applicant.avg_score === OVERQUALIFIED_SCORE
	) {
		return "OQ";
	}

	switch (applicant.auto_decision_reason) {
		case "UNDER_18":
			return "UNDERAGE";
		case "GRADUATED":
			return "GRADUATED";
		case "DIRECTOR_AUTO_ACCEPT":
			return "AUTO ACCEPT";
		default:
			return null;
	}
}

function getRawScore({ avg_score }: HackerApplicantSummary) {
	const isRealScore =
		avg_score !== NOT_FULLY_REVIEWED_SCORE && avg_score !== OVERQUALIFIED_SCORE;
	return isRealScore ? avg_score : null;
}

function getNormalizedScore({ application_data }: HackerApplicantSummary) {
	const scores = Object.values(application_data.normalized_scores ?? {});
	if (scores.length === 0) return null;

	const total = scores.reduce((sum, score) => sum + score, 0);
	return total / scores.length + (application_data.extra_points ?? 0);
}

function toRow(applicant: HackerApplicantSummary): ScoreRow {
	const { application_data } = applicant;
	const specialScoreLabel = getSpecialScoreLabel(applicant);

	return {
		id: applicant._id,
		// Names are hidden from non-directors
		name:
			`${applicant.first_name} ${applicant.last_name}`.trim() ||
			uidToPseudonym(applicant._id),
		email: application_data.email ?? "",
		major: application_data.major ?? "",
		linkedin: application_data.linkedin || null,
		resumeUrl: application_data.resume_url || null,
		rawScore: getRawScore(applicant),
		normalizedScore: specialScoreLabel ? null : getNormalizedScore(applicant),
		specialScoreLabel,
		decision: applicant.decision,
		reviews: application_data.reviews ?? [],
	};
}

// Order: scored (high to low), then unscored, then special labels
function compareRows(a: ScoreRow, b: ScoreRow) {
	if (a.normalizedScore !== null && b.normalizedScore !== null) {
		return b.normalizedScore - a.normalizedScore;
	}
	if (a.normalizedScore !== null) return -1;
	if (b.normalizedScore !== null) return 1;
	return Number(!!a.specialScoreLabel) - Number(!!b.specialScoreLabel);
}

export function buildScoreRows(
	applicants: ReadonlyArray<HackerApplicantSummary>,
): ScoreRow[] {
	return applicants
		.filter(
			(applicant) =>
				getSpecialScoreLabel(applicant) !== null ||
				applicant.avg_score !== NOT_FULLY_REVIEWED_SCORE,
		)
		.map(toRow)
		.sort(compareRows);
}

export function formatScore(score: number | null) {
	return score === null ? "-" : score.toFixed(2);
}
