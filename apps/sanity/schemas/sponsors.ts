import { defineType, defineField, defineArrayMember } from "sanity";
import { HeartHandshake } from "lucide-react";

export default defineType({
	name: "sponsors",
	title: "Sponsors",
	icon: HeartHandshake,
	type: "document",
	fields: [
		defineField({
			name: "sponsors",
			title: "Sponsors",
			type: "array",
			of: [
				defineArrayMember({
					type: "object",
					name: "sponsor",
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
							name: "tier",
							title: "Tier",
							type: "string",
							options: {
								list: [
									{
										title: "Platinum",
										value: "platinum",
									},
									{
										title: "Gold",
										value: "gold",
									},
									{
										title: "Silver",
										value: "silver",
									},
									{
										title: "Bronze",
										value: "bronze",
									},
									{
										title: "Sponsored Prize",
										value: "sponsored-prize",
									},
									{
										title: "In-Kind",
										value: "in-kind",
									},
								],
								layout: "radio",
								direction: "vertical",
							},
							validation: (Rule) => Rule.required(),
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
