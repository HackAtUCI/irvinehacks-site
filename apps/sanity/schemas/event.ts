import { defineType, defineField, defineArrayMember } from "sanity";
import { CalendarClock } from "lucide-react";

export default defineType({
	name: "event",
	title: "Event",
	icon: CalendarClock,
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "location",
			title: "Location",
			type: "string",
		}),
		defineField({
			name: "virtual",
			title: "Virtual Meeting Link",
			type: "url",
		}),
		defineField({
			name: "startTime",
			title: "Start Time",
			type: "datetime",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "endTime",
			title: "End Time",
			type: "datetime",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "organization",
			title: "Organization",
			type: "string",
		}),
		defineField({
			name: "hosts",
			title: "Hosts",
			type: "array",
			of: [defineArrayMember({ type: "string" })],
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
	],
});
