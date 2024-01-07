import { z } from "zod";
import { cache } from "react";
import { client } from "@/lib/sanity/client";
import { SanityDocument, SanityReference } from "@/lib/sanity/types";

const Resources = z.array(
	SanityDocument.extend({
		_type: z.literal("resource"),
		link: z.string(),
		title: z.string(),
		resourceType: SanityReference,
	}),
);

export const getResources = cache(async () => {
	return Resources.parse(await client.fetch("*[_type == 'resource']"));
});
