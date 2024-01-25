import { defineType, defineField, defineArrayMember } from "sanity";
import { HeartHandshake } from "lucide-react";

export default defineType({
	name: "partners",
	title: "Partners",
	icon: HeartHandshake,
	type: "document",
	fields: [
		defineField({
			name: "partners",
			title: "Partners",
			type: "array",
			of: [
				defineArrayMember({
					type: "object",
					name: "partner",
					fields: [
						defineField({
							name: "name",
							title: "Name",
							type: "string",
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: "url",
							title: "URL",
							type: "url",
						}),
						defineField({
							name: "logo",
							title: "Logo",
							type: "image",
							validation: (Rule) => Rule.required(),
						}),
					],
				}),
			],
		}),
	],
});
