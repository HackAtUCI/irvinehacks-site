import { defineType, defineField, defineArrayMember } from "sanity";
import { Users } from "lucide-react";

export default defineType({
	name: "organizers",
	title: "Organizers",
	icon: Users,
	type: "document",
	fields: [
		defineField({
			name: "organizers",
			title: "Organizers",
			type: "array",
			of: [
				defineArrayMember({
					type: "object",
					name: "organizer",
					fields: [
						defineField({
							name: "name",
							title: "Name",
							type: "string",
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: "department",
							title: "Department",
							type: "string",
							validation: (Rule) => Rule.required(),
							options: {
								list: [
									{ title: "Tech", value: "Tech" },
									{ title: "Marketing", value: "Marketing" },
									{ title: "Logistics", value: "Logistics" },
									{ title: "Corporate", value: "Corporate" },
									{ title: "Graphics", value: "Graphics" },
								],
							},
						}),
						defineField({
							name: "role",
							title: "Role",
							type: "string",
							validation: (Rule) => Rule.required(),
							options: {
								list: [
									{ title: "Director", value: "Director" },
									{ title: "Organizer", value: "Organizer" },
									{ title: "Intern", value: "Intern" },
									{ title: "Advisor", value: "Advisor" },
								],
							},
						}),
						defineField({
							name: "image",
							title: "Profile Image",
							type: "image",
							options: {
								hotspot: true,
							},
						}),
						defineField({
							name: "link",
							title: "Social Link",
							type: "url",
							description: "LinkedIn or other social media profile link",
						}),
					],
				}),
			],
		}),
	],
});
