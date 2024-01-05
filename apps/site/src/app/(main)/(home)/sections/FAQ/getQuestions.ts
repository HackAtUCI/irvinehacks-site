import { z } from "zod";
import { cache } from "react";
import { client } from "@/lib/sanity/client";
import { SanityDocument } from "@/lib/sanity/types";

const Questions = z.array(
	SanityDocument.extend({
		faqs: z.array(
			z.object({
				answer: z.array(
					z.object({
						_key: z.string(),
						markDefs: z.array(
							z.object({
								_type: z.string(),
								href: z.optional(z.string()),
								_key: z.string(),
							}),
						),
						children: z.array(
							z.object({
								text: z.string(),
								_key: z.string(),
								_type: z.literal("span"),
								marks: z.array(z.string()),
							}),
						),
						_type: z.literal("block"),
						style: z.literal("normal"),
					}),
				),
				question: z.string(),
				_type: z.literal("faq"),
				_key: z.string(),
			}),
		),
	}),
);

export const getQuestions = cache(async () => {
	return Questions.parse(await client.fetch("*[_type == 'faqs']"));
});
