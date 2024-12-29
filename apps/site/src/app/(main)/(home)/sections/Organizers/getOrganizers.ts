import hackerSprite from "@/assets/images/volunteer_sprite.png";
import { StaticImageData } from "next/image";
import { z } from "zod";
import { cache } from "react";
// import { client } from "@/lib/sanity/client";
import { SanityDocument, SanityImageReference } from "@/lib/sanity/types";

interface Organizer {
	name: string;
	department: string;
	image: StaticImageData;
	link: string;
}

export const Organizer = z.object({
	_type: z.literal("organizer"),
	_key: z.string(),
	name: z.string(),
	department: z.string(),
	image: SanityImageReference,
	link: z.string().url().optional(),
});

// const Organizers = SanityDocument.extend({
// 	organizers: z.array(Organizer),
// });

export const getOrganizers = cache(async () => {
	const placeholderOrganizers = [
		{
			name: "Albert Wang",
			department: "Tech Director",
			image: hackerSprite,
			link: "#",
		},
		{
			name: "Boqian Liu",
			department: "Tech Organizer",
			image: hackerSprite,
			link: "#",
		},
		{
			name: "Ian Dai",
			department: "Tech Organizer",
			image: hackerSprite,
			link: "#",
		},
		{
			name: "Jenny Liu",
			department: "Tech Organizer",
			image: hackerSprite,
			link: "#",
		},
		{
			name: "Andrew Hwang",
			department: "Tech Organizer",
			image: hackerSprite,
			link: "#",
		},
		{
			name: "Jay Wu",
			department: "Tech Organizer",
			image: hackerSprite,
			link: "#",
		},
		{
			name: "Noah Kim",
			department: "Tech Organizer",
			image: hackerSprite,
			link: "#",
		},
		{
			name: "Cyril Joby",
			department: "Tech Organizer",
			image: hackerSprite,
			link: "#",
		},
	];

	return placeholderOrganizers;
});
