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

// Missing scores are lowest, so they never mix with real scores
function compareScores(a: number | null, b: number | null) {
	if (a !== null && b !== null) return a - b;
	return Number(a !== null) - Number(b !== null);
}

export function compareRawScores(a: ScoreRow, b: ScoreRow) {
	return compareScores(a.rawScore, b.rawScore);
}

// Special labels are below missing scores
export function compareNormalizedScores(a: ScoreRow, b: ScoreRow) {
	return (
		compareScores(a.normalizedScore, b.normalizedScore) ||
		Number(!a.specialScoreLabel) - Number(!b.specialScoreLabel)
	);
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
		.sort((a, b) => compareNormalizedScores(b, a));
}

export function formatScore(score: number | null) {
	return score === null ? "-" : score.toFixed(2);
}
