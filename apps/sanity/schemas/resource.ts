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
			type: "reference",
			to: [{ type: "resourceCategory" }],
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
			name: "icon",
			title: "Icon",
			type: "image",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "link",
			title: "Link",
			type: "url",
			validation: (Rule) => Rule.optional(),
		}),
		defineField({
			name: "pdfFile",
			title: "PDF File",
			type: "file",
			options: {
				accept: ".pdf",
			},
			validation: (Rule) => Rule.optional(),
		}),
		defineField({
			name: "linkFragment",
			title: "URL Fragment (e.g. #page=9)",
			type: "string",
			description: "Optional. Add #page=9 to open PDF at a specific page.",
			validation: (Rule) => Rule.optional(),
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
