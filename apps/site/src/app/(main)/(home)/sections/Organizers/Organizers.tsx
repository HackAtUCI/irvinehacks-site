"use client";

import { getOrganizers } from "./getOrganizers";
import { InfiniteMovingCards } from "./InfiniteMovingCards";
import styles from "./Organizers.module.scss";
import { useEffect, useState } from "react";
import { client } from "@/lib/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import hackerSprite from "@/assets/images/volunteer_sprite.png";

const builder = imageUrlBuilder(client);

interface OrganizerCardData {
	quote: string;
	name: string;
	title: string;
	image: string;
	link: string;
}

const letsShuffle = <T,>(array: T[]): T[] => {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
};

export default function Organizers() {
	const [organizers, setOrganizers] = useState<OrganizerCardData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadOrganizers = async () => {
			try {
				setIsLoading(true);
				const data = await getOrganizers();
				if (Array.isArray(data)) {
					const mappedData = data.map((organizer) => ({
						quote: "",
						name: organizer.name,
						title: `${organizer.department} ${organizer.role}`,
						image: organizer.image
							? builder.image(organizer.image).format("webp").url()
							: hackerSprite.src,
						link: organizer.link || "#",
					}));
					const shuffledData = letsShuffle(mappedData);
					setOrganizers(shuffledData);
				}
			} catch (error) {
				console.error("Error loading organizers:", error);
				setOrganizers([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadOrganizers();
	}, []);

	if (isLoading) {
		return null; // or return a loading spinner if you prefer
	}

	return (
		<section className="container relative mx-auto w-full flex flex-col items-center justify-center">
			<InfiniteMovingCards
				items={organizers}
				direction="left"
				speed="slow"
				pauseOnHover={true}
				className={styles.carousel}
			/>
		</section>
	);
}
