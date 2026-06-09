import { z } from "zod";
import { cache } from "react";
import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";

export const ZothacksHackerScoringGuidelines = z.object({
	_id: z.string(),
	_type: z.literal("zothacksHackerScoringGuidelines"),
	guidelines: z.object({
		resume: z.array(z.any()),
		collaboration_saq: z.array(z.any()),
		tech_inspiration_saq: z.array(z.any()),
		uci_gift_saq: z.array(z.any()),
	}),
});

export type ZothacksHackerScoringGuidelinesType = z.infer<
	typeof ZothacksHackerScoringGuidelines
>;

export const getZothacksHackerScoringGuidelines = cache(async () => {
	const data = await client.fetch(
		groq`*[_type == "zothacksHackerScoringGuidelines"][0]{
      _id,
      _type,
      guidelines {
        resume,
        collaboration_saq,
        tech_inspiration_saq,
        uci_gift_saq
      }
    }`,
	);

	return ZothacksHackerScoringGuidelines.parse(data);
});
