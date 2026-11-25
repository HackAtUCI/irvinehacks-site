import { Decision } from "@/lib/userRecord";

import { ScoreRow } from "./scoreRows";

export interface ScoreRange {
	min: string;
	max: string;
}

export interface ScoreFilterValues {
	rawScore: ScoreRange;
	normalizedScore: ScoreRange;
	decisions: ReadonlyArray<Decision>;
}

export const EMPTY_FILTERS: ScoreFilterValues = {
	rawScore: { min: "", max: "" },
	normalizedScore: { min: "", max: "" },
	decisions: [],
};

export function isInvalidRange({ min, max }: ScoreRange) {
	return min !== "" && max !== "" && Number(min) > Number(max);
}

function matchesRange(score: number | null, { min, max }: ScoreRange) {
	if (min === "" && max === "") return true;
	if (score === null) return false;

	// Compare the rounded score, since that's what the table shows
	const shownScore = Number(score.toFixed(2));
	return (
		(min === "" || shownScore >= Number(min)) &&
		(max === "" || shownScore <= Number(max))
	);
}

export function matchesFilters(row: ScoreRow, filters: ScoreFilterValues) {
	const matchesDecision =
		filters.decisions.length === 0 ||
		(row.decision !== null && filters.decisions.includes(row.decision));

	return (
		matchesDecision &&
		matchesRange(row.rawScore, filters.rawScore) &&
		matchesRange(row.normalizedScore, filters.normalizedScore)
	);
}
