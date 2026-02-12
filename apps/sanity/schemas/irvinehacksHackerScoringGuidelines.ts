import { defineType, defineField } from "sanity";
import { Newspaper } from "lucide-react";

export default defineType({
	name: "irvinehacksHackerScoringGuidelines",
	title: "IrvineHacks Hacker Scoring Guidelines",
	icon: Newspaper,
	type: "document",
	fields: [
		defineField({
			name: "guidelines",
			title: "Guidelines",
			type: "object",
			fields: [
				defineField({
					name: "frq_guideline",
					title: "FRQ Guideline",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "prev_experience",
					title: "Previous Experience",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "frq_change",
					title: "FRQ Change",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "frq_ambition",
					title: "FRQ Ambition",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "frq_character",
					title: "FRQ Character",
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
