import { z } from "zod";
import { cache } from "react";
import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";

export const ZothacksScoringGuidelines = z.object({
	_id: z.string(),
	_type: z.literal("zothacksScoringGuidelines"),
	guidelines: z.object({
		resume: z.string(),
		elevator_pitch_saq: z.string(),
		tech_experience_saq: z.string(),
		learn_about_self_saq: z.string(),
		pixel_art_saq: z.string(),
	}),
});

export type ZothacksScoringGuidelinesType = z.infer<
	typeof ZothacksScoringGuidelines
>;

export const getZothacksScoringGuidelines = cache(async () => {
	const data = await client.fetch(
		groq`*[_type == "zothacksScoringGuidelines"][0]{
      _id,
      _type,
      guidelines {
        resume,
        elevator_pitch_saq,
        tech_experience_saq,
        learn_about_self_saq,
        pixel_art_saq
      }
    }`,
	);

	return ZothacksScoringGuidelines.parse(data);
});
