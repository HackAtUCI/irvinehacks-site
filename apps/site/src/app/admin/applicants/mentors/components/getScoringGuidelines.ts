import { cache } from "react";
import { z } from "zod";
import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";

export const IrvineHacksMentorScoringGuidelines = z.object({
	_id: z.string(),
	_type: z.literal("irvinehacksMentorScoringGuidelines"),
	guidelines: z.object({
		mentor_prev_experience_saq1: z.array(z.any()).optional(),
		mentor_interest_saq2: z.array(z.any()).optional(),
		mentor_tech_saq3: z.array(z.any()).optional(),
		mentor_design_saq4: z.array(z.any()).optional(),
		mentor_interest_saq5: z.array(z.any()).optional(),
	}),
});

export type IrvineHacksMentorScoringGuidelinesType = z.infer<
	typeof IrvineHacksMentorScoringGuidelines
>;

export const getIrvineHacksMentorScoringGuidelines = cache(async () => {
	const data = await client.fetch(
		groq`*[_type == "irvinehacksMentorScoringGuidelines"][0]{
      _id,
      _type,
      guidelines {
        mentor_prev_experience_saq1,
        mentor_interest_saq2,
        mentor_tech_saq3,
		mentor_design_saq4,
        mentor_interest_saq5
      }
    }`,
	);

	return IrvineHacksMentorScoringGuidelines.parse(data);
});
