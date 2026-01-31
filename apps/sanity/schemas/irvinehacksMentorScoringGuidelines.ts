import { defineType, defineField } from "sanity";
import { Newspaper } from "lucide-react";

export default defineType({
	name: "irvinehacksMentorScoringGuidelines",
	title: "IrvineHacks Mentor Scoring Guidelines",
	icon: Newspaper,
	type: "document",
	fields: [
		defineField({
			name: "guidelines",
			title: "Guidelines",
			type: "object",
			fields: [
				defineField({
					name: "mentor_prev_experience_saq1",
					title: "Previous Experience (SAQ1)",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "mentor_interest_saq2",
					title: "Interest (SAQ2)",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "mentor_tech_saq3",
					title: "Helping with Bug (SAQ3)",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "mentor_design_saq4",
					title: "Helping with Design Problem (SAQ4)",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "mentor_interest_saq5",
					title: "Ambitious Idea (SAQ5)",
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
