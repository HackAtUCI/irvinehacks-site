import { Decision } from "./userRecord";

/** For use in nonhacker applicant reviews.*/
const acceptScore = 100;
const waitlistScore = -2;
const rejectScore = 0;

export const decisionsToScores: Record<Decision, number> = {
	[Decision.accepted]: acceptScore,
	[Decision.waitlisted]: waitlistScore,
	[Decision.rejected]: rejectScore,
};

export const scoresToDecisions: Record<string, Decision> = {
	[acceptScore]: Decision.accepted,
	[waitlistScore]: Decision.waitlisted,
	[rejectScore]: Decision.rejected,
};
