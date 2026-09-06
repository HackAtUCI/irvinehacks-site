import { z } from "zod";
import { cache } from "react";
import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";

const portableTextBlocks = z
	.array(z.any())
	.nullish()
	.transform((value) => value ?? []);

export const ZothacksHackerScoringGuidelines = z.object({
	_id: z.string(),
	_type: z.literal("zothacksHackerScoringGuidelines"),
	guidelines: z.object({
		resume: portableTextBlocks,
		collaboration_saq: portableTextBlocks,
		tech_inspiration_saq: portableTextBlocks,
		uci_gift_saq: portableTextBlocks,
		drawing_response: portableTextBlocks,
		peter_thought_process_saq: portableTextBlocks,
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
        uci_gift_saq,
        drawing_response,
        peter_thought_process_saq,
      }
    }`,
	);

	return ZothacksHackerScoringGuidelines.parse(data);
});
