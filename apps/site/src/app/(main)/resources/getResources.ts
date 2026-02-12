import { z } from "zod";
import { cache } from "react";
import { client } from "@/lib/sanity/client";
import { SanityDocument, SanityReference } from "@/lib/sanity/types";
import { groq } from "next-sanity";

const Resources = z.object({
	order: z.array(
		z.object({
			_id: z.string(),
			iconUrl: z.string(),
			title: z.string(),
			description: z.string(),
			resources: z.array(
				SanityDocument.extend({
					_type: z.literal("resource"),
					_id: z.string(),
					_createdAt: z.string().datetime(),
					_updatedAt: z.string().datetime(),
					_rev: z.string(),
					link: z.string(),
					title: z.string(),
					resourceIconUrl: z.string(),
					resourceType: SanityReference,
				}).passthrough(),
			),
		}),
	),
});

export const getResources = cache(async () => {
	return Resources.parse(
		await client.fetch(groq`
			*[_type == 'resourceCategoryOrder' && _id == "resourceCategoryOrder"][0] {
				order[]->{
					_id,
					'iconUrl': icon.asset->url,
					title,
					description,
					'resources': *[_type == 'resource' && resourceType._ref == ^._id] | order(title asc) {
						_id,
						_createdAt,
						_updatedAt,
						_rev,
						'_type': _type,
						'link': coalesce(pdfFile.asset->url, link) + coalesce(linkFragment, ""),
						title,
						'resourceIconUrl': coalesce(icon.asset->url, ""),
						resourceType
					}
				}
			}
		`),
	);
});
