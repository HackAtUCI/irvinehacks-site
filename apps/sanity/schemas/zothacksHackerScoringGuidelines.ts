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
					name: "elevator_pitch_saq",
					title: "Elevator Pitch SAQ",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "tech_experience_saq",
					title: "Tech Experience SAQ",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "learn_about_self_saq",
					title: "Learn About Self SAQ",
					type: "array",
					of: [{ type: "block" }],
				}),
				defineField({
					name: "pixel_art_saq",
					title: "Pixel Art SAQ",
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
