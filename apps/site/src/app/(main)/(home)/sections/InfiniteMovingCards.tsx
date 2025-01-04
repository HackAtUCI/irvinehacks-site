"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import box from "@/assets/images/center_chat_box.svg";
import boxBG from "@/assets/images/center_chat_box_bg.svg";
import Link from "next/link";

export const InfiniteMovingCards = ({
	items,
	direction = "left",
	speed = "fast",
	pauseOnHover = true,
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

	useEffect(() => {
		if (!containerRef.current || !scrollerRef.current) return;

		// Clear existing clones
		while (scrollerRef.current.children.length > items.length) {
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
