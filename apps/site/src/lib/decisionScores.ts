import { Decision } from "./userRecord";

/** For use in nonhacker applicant reviews.*/
const acceptScore = 100;
const waitlistScore = -2;
const rejectScore = 0;

export const decisionsToScores: Record<Decision, number> = {
	[Decision.Accepted]: acceptScore,
	[Decision.Waitlisted]: waitlistScore,
	[Decision.Rejected]: rejectScore,
};

export const scoresToDecisions: Record<string, Decision> = {
	[acceptScore]: Decision.Accepted,
	[waitlistScore]: Decision.Waitlisted,
	[rejectScore]: Decision.Rejected,
};
