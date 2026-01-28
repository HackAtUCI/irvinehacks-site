export interface IrvineHacksHackerScoredFields {
	has_socials?: number;
	previous_experience?: number;
	frq_change?: number;
	frq_ambition?: number;
	frq_character?: number;
}

export interface ZotHacksHackerScoredFields {
	resume?: number;
	elevator_pitch_saq?: number;
	tech_experience_saq?: number;
	learn_about_self_saq?: number;
	pixel_art_saq?: number;
	hackathon_experience?: number;
}

export interface IrvineHacksMentorScoredFields {}
export interface IrvineHacksVolunteerScoredFields {}

export type ScoredFields =
	| IrvineHacksHackerScoredFields
	| IrvineHacksMentorScoredFields
	| IrvineHacksVolunteerScoredFields
	| ZotHacksHackerScoredFields;

export const HACKER_WEIGHTING_CONFIG: Record<
	keyof IrvineHacksHackerScoredFields,
	[number, number]
> = {
	frq_change: [20, 0.2],
	frq_ambition: [20, 0.25],
	frq_character: [20, 0.2],
	previous_experience: [1, 0.3],
	has_socials: [1, 0.05],
};
