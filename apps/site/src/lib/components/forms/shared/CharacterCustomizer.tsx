"use client";

import React, { useState } from "react";
import Image from "next/image";

// Backgrounds & Icons
import perspectiveGrid from "@/assets/backgrounds/perspective-grid.svg";
import hudBackground from "@/assets/images/character-customizer-background.svg";
import leftArrow from "@/assets/icons/left_arrow.svg";
import rightArrow from "@/assets/icons/right_arrow.svg";

// Character Assets - Heads
import head1 from "@/assets/images/characterCustomizer/head_front_1.png";
import head2 from "@/assets/images/characterCustomizer/head_front_2.png";
import head3 from "@/assets/images/characterCustomizer/head_front_3.png";
import head4 from "@/assets/images/characterCustomizer/head_front_4.png";

// Character Assets - Bodies
import body1 from "@/assets/images/characterCustomizer/body_front_1.png";
import body3 from "@/assets/images/characterCustomizer/body_front_3.png";
import body4 from "@/assets/images/characterCustomizer/body_arms.png";
import head5 from "@/assets/images/characterCustomizer/head_front_5.png";

// Character Assets - Feet
import feet1 from "@/assets/images/characterCustomizer/feet_front.png";
import feet2 from "@/assets/images/characterCustomizer/feet_front_2.png";
import feet3 from "@/assets/images/characterCustomizer/feet_front_3.png";
import feet4 from "@/assets/images/characterCustomizer/feet_front_4.png";
import feet6 from "@/assets/images/characterCustomizer/feet_front_6.png";

// Character Assets - Companions
import companion1 from "@/assets/images/characterCustomizer/companion_1.png";
import companion2 from "@/assets/images/characterCustomizer/companion_2.png";
import companion3 from "@/assets/images/characterCustomizer/companion_3.png";
import companion4 from "@/assets/images/characterCustomizer/companion_4.png";

// Base/Blank Character Parts
import blankBody from "@/assets/images/characterCustomizer/blank_body.png";
import blankHead from "@/assets/images/characterCustomizer/blank_head.png";
import blankTail from "@/assets/images/characterCustomizer/blank_tail.png";

const HEADS: [any, string][] = [
	[head1, "Kitty Headphones"],
	[head2, "Among Us"],
	[head3, "LED Mask"],
	[head4, "Hood"],
];
const BODIES: [any, string][] = [
	[body1, "Number"],
	[body3, "Coat"],
	[body4, "Robotic Arms"],
	[head5, "Necklace"],
];
const FEET: [any, string][] = [
	[feet1, "Hover Boots"],
	[feet2, "Black Boots"],
	[feet3, "Astro Boots"],
	[feet4, "Neon Anklets"],
	[feet6, "Cyber Anklets"],
];
const COMPANIONS: [any, string][] = [
	[companion1, "Drone"],
	[companion2, "Robopetr"],
	[companion3, "Holo"],
	[companion4, "Tether"],
];

const imageWidth = 600;

export const CharacterCustomizer = () => {
	const [headIndex, setHeadIndex] = useState(0);
	const [bodyIndex, setBodyIndex] = useState(0);
	const [feetIndex, setFeetIndex] = useState(0);
	const [companionIndex, setCompanionIndex] = useState(0);

	const cycleIndex = (
		current: number,
		max: number,
		direction: "prev" | "next",
	) => {
		if (direction === "next") {
			return (current + 1) % max;
		} else {
			return (current - 1 + max) % max;
		}
	};

	return (
		<div className="relative w-11/12 border-white border-4 rounded-xl bg-gradient-to-b from-[#02031D] via-[#090D83] via-54% to-[#090D83]">
			<div className="h-[400px] w-full flex items-center justify-center">
				{/* Perspective Grid Layer */}
				<div className="absolute bottom-0 h-full w-full inset-0 z-0">
					<Image
						src={perspectiveGrid}
						alt="Perspective Grid"
						className="absolute bottom-0"
						priority
					/>
				</div>
				{/* Main Content Area */}
				<div className="relative z-10 w-full max-w-[800px] h-full flex items-center justify-center">
					{/* HUD Frame Background */}
					<div className="invisible lg:visible absolute inset-0 flex items-center justify-center pointer-events-none z-20">
						<Image
							src={hudBackground}
							alt="Interface Frame"
							width={400}
							height={300}
							className="max-w-[600px] md:max-w-[700px] object-contain"
							priority
						/>
					</div>
					{/* Character Composite */}
					<div className="relative z-30 w-[400px] h-[400px] flex items-center justify-center mt-10">
						{/* Blank Tail (Base Layer) */}
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src={blankTail}
								alt="Base Tail"
								width={imageWidth}
								height={imageWidth}
								className="object-contain"
								priority
							/>
						</div>
						{/* Blank Body (Base Layer) */}
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src={blankBody}
								alt="Base Body"
								width={imageWidth}
								height={imageWidth}
								className="object-contain"
								priority
							/>
						</div>
						{/* Blank Head (Base Layer) */}
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src={blankHead}
								alt="Base Head"
								width={imageWidth}
								height={imageWidth}
								className="object-contain"
								priority
							/>
						</div>
						{/* Feet (Customizable Layer) */}
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src={FEET[feetIndex][0]}
								alt="Character Feet"
								width={imageWidth}
								height={imageWidth}
								className="object-contain"
								priority
							/>
						</div>
						{/* Body (Customizable Layer) */}
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src={BODIES[bodyIndex][0]}
								alt="Character Body"
								width={imageWidth}
								height={imageWidth}
								className="object-contain"
								priority
							/>
						</div>
						{/* Head (Customizable Layer) */}
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src={HEADS[headIndex][0]}
								alt="Character Head"
								width={imageWidth}
								height={imageWidth}
								className="object-contain"
								priority
							/>
						</div>
						{/* Companion (Customizable Layer - Top Layer) */}
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src={COMPANIONS[companionIndex][0]}
								alt="Character Companion"
								width={imageWidth}
								height={imageWidth}
								className="object-contain"
								priority
							/>
						</div>
					</div>
					{/* Controls & Labels Layer */}
					<div className="absolute inset-0 z-40 w-full h-full pointer-events-none">
						{/* We use pointer-events-auto on the interactive elements */}
						{/* Left Controls (Arrows) */}
						<div className="absolute left-[5%] xl:left-[15%] top-1/2 -translate-y-1/2 flex flex-col gap-12 pointer-events-auto">
							{/* Top Arrow - Head */}
							<button
								type="button"
								onClick={() =>
									setHeadIndex((i) => cycleIndex(i, HEADS.length, "prev"))
								}
								className="hover:scale-110 transition-transform p-2"
							>
								<Image
									src={leftArrow}
									alt="Previous Head"
									width={24}
									height={24}
								/>
							</button>
							{/* Second Arrow - Body */}
							<button
								type="button"
								onClick={() =>
									setBodyIndex((i) => cycleIndex(i, BODIES.length, "prev"))
								}
								className="hover:scale-110 transition-transform p-2"
							>
								<Image
									src={leftArrow}
									alt="Previous Body"
									width={24}
									height={24}
								/>
							</button>
							{/* Third Arrow - Feet */}
							<button
								type="button"
								onClick={() =>
									setFeetIndex((i) => cycleIndex(i, FEET.length, "prev"))
								}
								className="hover:scale-110 transition-transform p-2"
							>
								<Image
									src={leftArrow}
									alt="Previous Feet"
									width={24}
									height={24}
								/>
							</button>
							{/* Fourth Arrow - Companion */}
							<button
								type="button"
								onClick={() =>
									setCompanionIndex((i) =>
										cycleIndex(i, COMPANIONS.length, "prev"),
									)
								}
								className="hover:scale-110 transition-transform p-2"
							>
								<Image
									src={leftArrow}
									alt="Previous Companion"
									width={24}
									height={24}
								/>
							</button>
						</div>
						{/* Right Controls (Arrows) */}
						<div className="absolute right-[5%] xl:right-[15%] top-1/2 -translate-y-1/2 flex flex-col gap-12 pointer-events-auto">
							{/* Top Arrow - Head */}
							<button
								type="button"
								onClick={() =>
									setHeadIndex((i) => cycleIndex(i, HEADS.length, "next"))
								}
								className="hover:scale-110 transition-transform p-2"
							>
								<Image
									src={rightArrow}
									alt="Next Head"
									width={24}
									height={24}
								/>
							</button>
							{/* Second Arrow - Body */}
							<button
								type="button"
								onClick={() =>
									setBodyIndex((i) => cycleIndex(i, BODIES.length, "next"))
								}
								className="hover:scale-110 transition-transform p-2"
							>
								<Image
									src={rightArrow}
									alt="Next Body"
									width={24}
									height={24}
								/>
							</button>
							{/* Third Arrow - Feet */}
							<button
								type="button"
								onClick={() =>
									setFeetIndex((i) => cycleIndex(i, FEET.length, "next"))
								}
								className="hover:scale-110 transition-transform p-2"
							>
								<Image
									src={rightArrow}
									alt="Next Feet"
									width={24}
									height={24}
								/>
							</button>
							{/* Fourth Arrow - Companion */}
							<button
								type="button"
								onClick={() =>
									setCompanionIndex((i) =>
										cycleIndex(i, COMPANIONS.length, "next"),
									)
								}
								className="hover:scale-110 transition-transform p-2"
							>
								<Image
									src={rightArrow}
									alt="Next Companion"
									width={24}
									height={24}
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center mb-8">
				<div className="flex flex-col">
					<div>
						<p className="font-display">
							<span className="text-turquoise">Head:</span>{" "}
							{HEADS[headIndex][1]}
						</p>
					</div>
					<div>
						<p className="font-display">
							<span className="text-turquoise">Body:</span>{" "}
							{BODIES[bodyIndex][1]}
						</p>
					</div>
					<div>
						<p className="font-display">
							<span className="text-turquoise">Feet:</span> {FEET[feetIndex][1]}
						</p>
					</div>
					<div>
						<p className="font-display">
							<span className="text-turquoise">Companion:</span>{" "}
							{COMPANIONS[companionIndex][1]}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CharacterCustomizer;
