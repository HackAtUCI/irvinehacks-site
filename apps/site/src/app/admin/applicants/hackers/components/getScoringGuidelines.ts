import { cache } from "react";
import { z } from "zod";
import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";

export const IrvineHacksHackerScoringGuidelines = z.object({
	_id: z.string(),
	_type: z.literal("irvinehacksHackerScoringGuidelines"),
	guidelines: z.object({
		prev_experience: z.array(z.any()),
		frq_change: z.array(z.any()),
		frq_ambition: z.array(z.any()),
		frq_character: z.array(z.any()),
	}),
});

export type IrvineHacksHackerScoringGuidelinesType = z.infer<
	typeof IrvineHacksHackerScoringGuidelines
>;

export const getIrvineHacksHackerScoringGuidelines = cache(async () => {
	const data = await client.fetch(
		groq`*[_type == "irvinehacksHackerScoringGuidelines"][0]{
      _id,
      _type,
      guidelines {
        prev_experience,
        frq_change,
        frq_ambition,
        frq_character
      }
    }`,
	);

	return IrvineHacksHackerScoringGuidelines.parse(data);
});
