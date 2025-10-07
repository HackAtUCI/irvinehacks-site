"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import box from "@/assets/images/center_chat_box.svg";
import boxBG from "@/assets/images/center_chat_box_bg.svg";

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

	const duration =
		speed === "fast" ? "30s" : speed === "normal" ? "45s" : "270s";

	return (
		<div
			ref={containerRef}
			className="scroller relative z-[20] max-w-3xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] pt-28"
			style={
				{
					"--duration": duration,
				} as React.CSSProperties
			}
		>
			<ul
				ref={scrollerRef}
				className={`flex min-w-full shrink-0 gap-2 py-4 w-max flex-nowrap items-center justify-center ${
					start ? "animate-scroll" : ""
				} ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""} ${
					direction === "right" ? "[animation-direction:reverse]" : ""
				}`}
			>
				{items.map((item, idx) => (
					<li
						key={`${item.name}-${idx}`}
						className="relative flex-shrink-0 group"
						style={{ transform: "skew(-20deg)" }}
					>
						{/* Info popup on hover */}
						<div className="absolute -top-[110px] left-[12%] -translate-x-1/2 opacity-0 group-hover:opacity-100 z-[300] pointer-events-none transition-opacity">
							<div
								className="relative w-[200px] h-[100px]"
								style={{
									transform: "skew(20deg)",
								}}
							>
								{/* Background chat box - positioned slightly offset */}
								<div className="absolute inset-0 -right-1 -bottom-1">
									<Image
										src={boxBG}
										alt="Box Background"
										className="w-full h-full object-contain"
										style={{ maxWidth: "100%" }}
									/>
								</div>

								{/* Main chat box */}
								<div className="absolute inset-0">
									<Image
										src={box}
										alt="Box"
										className="w-full h-full object-contain"
										style={{ maxWidth: "100%" }}
									/>
								</div>

								<div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
									<p className="text-sm font-medium text-gray-200 leading-tight">
										{item.name}
									</p>
									<p className="text-xs text-gray-400 leading-tight">
										{item.title}
									</p>
								</div>
							</div>
						</div>

						{/* Card */}
						<div className="relative w-16 h-20 bg-black border-2 border-white overflow-hidden transition-transform group-hover:scale-105 group-hover:bg-[#006FB2]">
							<div
								className="absolute inset-0 bg-black group-hover:bg-[#006FB2]"
								style={{ transform: "skew(20deg) scale(1.2)" }}
							>
								<a
									href={item.link}
									target="_blank"
									className="relative block w-full h-full"
								>
									{/* eslint-disable-next-line @next/next/no-img-element*/}
									<img
										src={item.image}
										alt={item.name}
										className="object-cover w-full h-full opacity-75 group-hover:opacity-100"
										style={{ maxWidth: "100%" }}
									/>
								</a>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};
