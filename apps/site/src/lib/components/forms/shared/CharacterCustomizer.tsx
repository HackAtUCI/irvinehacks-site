"use client";

import React, { useState } from "react";
import Image from "next/image";

// Backgrounds & Icons
import perspectiveGrid from "@/assets/backgrounds/perspective-grid.svg";
import hudBackground from "@/assets/images/character-customizer-background.svg";
import leftArrow from "@/assets/icons/left_arrow.svg";
import rightArrow from "@/assets/icons/right_arrow.svg";

// Character Assets - Heads
import head1 from "@/assets/images/characterCustomizer/head_front_1.PNG";
import head2 from "@/assets/images/characterCustomizer/head_front_2.PNG";
import head3 from "@/assets/images/characterCustomizer/head_front_3.PNG";
import head4 from "@/assets/images/characterCustomizer/head_front_4.PNG";
import head5 from "@/assets/images/characterCustomizer/head_front_5.PNG";

// Character Assets - Bodies
import body1 from "@/assets/images/characterCustomizer/body_front_1.PNG";
import body2 from "@/assets/images/characterCustomizer/body_front_2.PNG";
import body3 from "@/assets/images/characterCustomizer/body_front_3.PNG";
import body4 from "@/assets/images/characterCustomizer/body_front_4.PNG";

// Character Assets - Feet
import feet1 from "@/assets/images/characterCustomizer/feet_front_1.PNG";
import feet2 from "@/assets/images/characterCustomizer/feet_front_2.PNG";
import feet3 from "@/assets/images/characterCustomizer/feet_front_3.PNG";
import feet4 from "@/assets/images/characterCustomizer/feet_front_4.PNG";
import feet5 from "@/assets/images/characterCustomizer/feet_front_5.PNG";
import feet6 from "@/assets/images/characterCustomizer/feet_front_6.PNG";

// Base/Blank Character Parts
import blankBody from "@/assets/images/characterCustomizer/blank_body.PNG";
import blankHead from "@/assets/images/characterCustomizer/blank_head.PNG";
import blankTail from "@/assets/images/characterCustomizer/blank_tail.PNG";

// Line SVGs
import lineHead from "@/assets/images/characterCustomizer/line_head.svg";
import lineBody from "@/assets/images/characterCustomizer/line_body.svg";
import lineFoot from "@/assets/images/characterCustomizer/line_foot.svg";

const HEADS = [head1, head2, head3, head4, head5];
const BODIES = [body1, body2, body3, body4];
const FEET = [feet1, feet2, feet3, feet4, feet5, feet6];

const imageWidth = 600;
const imageHeight = 300;

export const CharacterCustomizer = () => {
	const [headIndex, setHeadIndex] = useState(0);
	const [bodyIndex, setBodyIndex] = useState(0);
	const [feetIndex, setFeetIndex] = useState(0);

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
		<div className="relative w-11/12 h-[400px] border-white border-4 overflow-hidden rounded-xl bg-gradient-to-b from-[#02031D] via-[#090D83] via-54% to-[#090D83] flex items-center justify-center">
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
							src={FEET[feetIndex]}
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
							src={BODIES[bodyIndex]}
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
							src={HEADS[headIndex]}
							alt="Character Head"
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
						{/* Middle Arrow - Body */}
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
						{/* Bottom Arrow - Feet */}
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
							<Image src={rightArrow} alt="Next Head" width={24} height={24} />
						</button>
						{/* Middle Arrow - Body */}
						<button
							type="button"
							onClick={() =>
								setBodyIndex((i) => cycleIndex(i, BODIES.length, "next"))
							}
							className="hover:scale-110 transition-transform p-2"
						>
							<Image src={rightArrow} alt="Next Body" width={24} height={24} />
						</button>
						{/* Bottom Arrow - Feet */}
						<button
							type="button"
							onClick={() =>
								setFeetIndex((i) => cycleIndex(i, FEET.length, "next"))
							}
							className="hover:scale-110 transition-transform p-2"
						>
							<Image src={rightArrow} alt="Next Feet" width={24} height={24} />
						</button>
					</div>

					{/* Dynamic Labels */}
					{/* Positioning these involves some magic numbers to match the HUD lines if they are baked in, 
                or we can visually approximate based on the screenshot. 
                The screenshot has lines pointing to parts. I'll just place the text nearby for now.
            */}
					<div className="invisible lg:visible">
						<div className="absolute md:left-[27%] xl:left-[31%] 2xl:left-[32%] top-[29%] pointer-events-auto">
							<div className="flex flex-col items-center gap-2">
								<span className="text-cyan-400 font-mono text-sm uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
									Glasses {headIndex + 1}
								</span>
								<Image src={lineHead} alt="" className="hidden md:block" />
							</div>
						</div>

						<div className="absolute md:right-[27%] xl:right-[31%] 2xl:right-[32%] top-[38%] pointer-events-auto text-right">
							<div className="flex flex-col gap-2 flex-row-reverse">
								<span className="text-fuchsia-400 font-mono text-sm uppercase tracking-widest drop-shadow-[0_0_5px_rgba(232,121,249,0.8)]">
									Jacket {bodyIndex + 1}
								</span>
								<Image src={lineBody} alt="" className="hidden md:block" />
							</div>
						</div>

						<div className="absolute md:left-[30%] xl:left-[33%] 2xl:left-[34%] top-[48%] pointer-events-auto">
							<div className="flex flex-col">
								<span className="text-cyan-400 font-mono text-sm uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
									Pants {feetIndex + 1}
								</span>
								<Image src={lineFoot} alt="" className="hidden md:block" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CharacterCustomizer;
