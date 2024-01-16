import { z } from "zod";
import { cache } from "react";
import { client } from "@/lib/sanity/client";
import { SanityDocument, SanityImageReference } from "@/lib/sanity/types";

const ResourceReference = SanityDocument.extend({
	_type: z.literal("resourceCategory"),
	icon: SanityImageReference,
	description: z.string(),
	title: z.string(),
});

const Resources = z.array(
	SanityDocument.extend({
		_type: z.literal("resource"),
		link: z.string(),
		title: z.string(),
		resourceType: ResourceReference,
	}),
);

export const getResources = cache(async () => {
	return Resources.parse(
		await client.fetch("*[_type == 'resource']{..., resourceType-> }"),
	);
});
