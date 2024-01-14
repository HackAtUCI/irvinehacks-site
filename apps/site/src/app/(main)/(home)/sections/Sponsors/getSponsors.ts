import { z } from "zod";
import { cache } from "react";
import { client } from "@/lib/sanity/client";
import { SanityDocument, SanityImageReference } from "@/lib/sanity/types";

export const Sponsor = z.object({
	_type: z.literal("sponsor"),
	_key: z.string(),
	name: z.string(),
	url: z.string().url().optional(),
	tier: z.union([
		z.literal("platinum"),
		z.literal("gold"),
		z.literal("bronze"),
		z.literal("silver"),
		z.literal("sponsored-prize"),
		z.literal("in-kind"),
	]),
	logo: SanityImageReference,
});

const Sponsors = SanityDocument.extend({
	sponsors: z.array(Sponsor),
});

export const getSponsors = cache(async () => {
	return Sponsors.parse(await client.fetch("*[_type == 'sponsors'][0]"));
});
