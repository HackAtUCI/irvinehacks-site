"use client";

import { getOrganizers } from "./getOrganizers";
import { InfiniteMovingCards } from "./InfiniteMovingCards";
import styles from "./Organizers.module.scss";
import { useEffect, useState } from "react";
import { StaticImageData } from "next/image";

// Match this interface with the InfiniteMovingCards props
interface OrganizerCardData {
	quote: string;
	name: string;
	title: string;
	image: StaticImageData;
	link: string;
}

export default function Organizers() {
	const [organizers, setOrganizers] = useState<OrganizerCardData[]>([]);

	useEffect(() => {
		const loadOrganizers = async () => {
			try {
				const data = await getOrganizers();
				if (Array.isArray(data)) {
					const mappedData = data.map((organizer) => ({
						quote: "",
						name: organizer.name,
						title: organizer.department,
						image: organizer.image,
						link: organizer.link || "#",
					}));
					setOrganizers(mappedData);
				}
			} catch (error) {
				console.error("Error loading organizers:", error);
				setOrganizers([]);
			}
		};

		loadOrganizers();
	}, []);

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
