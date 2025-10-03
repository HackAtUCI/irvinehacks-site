"use client";

import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
	items,
}: {
	items: {
		quote: string;
		name: string;
		title: string;
		image: string;
		link: string;
	}[];
	direction?: "left" | "right";
	speed?: "fast" | "normal" | "slow";
	pauseOnHover?: boolean;
	className?: string;
}) => {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const scrollerRef = React.useRef<HTMLUListElement>(null);
	const [start, setStart] = useState(false);

	console.log(start);

	useEffect(() => {
		if (!containerRef.current || !scrollerRef.current) return;

		// Clear existing clones

		while (scrollerRef.current.children.length > items.length) {
			/* eslint-disable-next-line no-unused-expressions*/
			scrollerRef.current.lastChild &&
				scrollerRef.current.removeChild(scrollerRef.current.lastChild);
		}

		// Clone items just once for infinite scroll
		const originalItems = Array.from(scrollerRef.current.children).slice(
			0,
			items.length,
		);
		originalItems.forEach((item) => {
			const duplicatedItem = item.cloneNode(true);
			if (scrollerRef.current) {
				scrollerRef.current.appendChild(duplicatedItem);
			}
		});

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setStart(true);
					}
				});
			},
			{ threshold: 0.1 },
		);

		observer.observe(containerRef.current);

		return () => {
			observer.disconnect();
		};
	}, [items]);

	// ... rest of the component stays the same ...
};
