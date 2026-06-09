import { defineType, defineField } from "sanity";
import { Newspaper } from "lucide-react";

export default defineType({
	name: "zothacksHackerScoringGuidelines",
	title: "Zothacks Hacker Scoring Guidelines",
	icon: Newspaper,
	type: "document",
	fields: [
		defineField({
			name: "guidelines",
			title: "Guidelines",
			type: "object",
			fields: [
				defineField({
					name: "resume",
					title: "Resume",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "collaboration_saq",
					title: "Collaboration SAQ",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "tech_inspiration_saq",
					title: "Tech Inspiration SAQ",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "uci_gift_saq",
					title: "UCI Gift SAQ",
					type: "array",
					of: [{ type: "block" }],
				}),
			],
			options: {
				collapsible: true,
				collapsed: false,
			},
		}),
	],
});
