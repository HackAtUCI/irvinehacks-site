import { defineType, defineField, defineArrayMember } from "sanity";
import { Globe } from "lucide-react";

export default defineType({
	name: "resource",
	title: "Resources",
	type: "document",
	icon: Globe,
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "resourceType",
			title: "Resource Type",
			type: "string",
			options: {
				list: [
					{ title: "API", value: "api" },
					{ title: "Backend", value: "backend" },
					{ title: "Frontend", value: "frontend" },
					{ title: "Starter Pack", value: "starter-pack" },
				],
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "array",
			of: [
				defineArrayMember({
					type: "block",
					styles: [{ title: "Normal", value: "normal" }],
					lists: [],
				}),
			],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "link",
			title: "Link",
			type: "url",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "logo",
			title: "Logo",
			type: "image",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "stickyNoteColor",
			title: "Sticky Note Color",
			description:
				"Note that the color will be used as a background for black text, so please choose a color with enough contrast.",
			type: "color",
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			title: "title",
			subtitle: "description",
			media: "logo",
		},
	},
});
