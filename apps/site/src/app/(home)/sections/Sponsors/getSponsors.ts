import { z } from "zod";
import { cache } from "react";
import { client } from "@/lib/sanity/client";
import { SanityDocument, SanityImageReference } from "@/lib/sanity/types";

const Sponsors = SanityDocument.extend({
	sponsors: z.array(
		z.object({
			_type: z.literal("sponsor"),
			_key: z.string(),
			name: z.string(),
			url: z.string().url().optional(),
			tier: z.union([z.literal("bronze"), z.literal("silver")]),
			logo: SanityImageReference,
		}),
	),
});

export const getSponsors = cache(async () => {
	return Sponsors.parse(await client.fetch("*[_type == 'sponsors'][0]"));
});
