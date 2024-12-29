"use client";

import React, { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
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
		image: StaticImageData;
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

		// Clone items multiple times to ensure smooth infinite scroll
		const scrollerContent = Array.from(scrollerRef.current.children);
		// Clone enough times to ensure continuous scroll
		for (let i = 0; i < 2; i++) {
			scrollerContent.forEach((item) => {
				const duplicatedItem = item.cloneNode(true);
				if (scrollerRef.current) {
					scrollerRef.current.appendChild(duplicatedItem);
				}
			});
		}

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
		speed === "fast" ? "30s" : speed === "normal" ? "45s" : "50s";

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
						<div className="absolute -top-[110px] left-[12%] -translate-x-1/2 opacity-0 group-hover:opacity-100 z-[300] pointer-events-none">
							<div
								className="relative w-[200px] h-[100px]"
								style={{
									transform: "skew(20deg)",
								}}
							>
								{/* Background chat box - positioned slightly offset */}
								<div className="absolute -right-1 -bottom-1 w-full h-full">
									<Image
										src={boxBG}
										alt="Box Background"
										fill
										className="object-contain"
										priority
									/>
								</div>

								{/* Main chat box */}
								<Image
									src={box}
									alt="Box"
									fill
									className="object-contain"
									priority
								/>
								<div className="absolute w-full h-full flex flex-col items-center justify-center gap-0">
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
								style={{ transform: "skew(30deg) scale(1.2)" }}
							>
								<Link href={item.link} target="_blank">
									<Image
										src={item.image}
										alt={item.name}
										fill
										className="object-cover opacity-75 group-hover:opacity-100"
										style={{ transform: "skew(-20deg) scale(0.8)" }}
									/>
								</Link>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};
