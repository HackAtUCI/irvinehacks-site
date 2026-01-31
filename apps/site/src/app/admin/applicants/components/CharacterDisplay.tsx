import React from "react";
import Image, { StaticImageData } from "next/image";

// Backgrounds & Icons
import perspectiveGrid from "@/assets/backgrounds/perspective-grid.svg";
import hudBackground from "@/assets/images/character-customizer-background.svg";

// Character Assets - Heads
import head1 from "@/assets/images/characterCustomizer/head_front_1.png";
import head2 from "@/assets/images/characterCustomizer/head_front_2.png";
import head3 from "@/assets/images/characterCustomizer/head_front_3.png";
import head4 from "@/assets/images/characterCustomizer/head_front_4.png";

// Character Assets - Bodies
import body1 from "@/assets/images/characterCustomizer/body_front_1.png";
import body3 from "@/assets/images/characterCustomizer/body_front_3.png";
import body4 from "@/assets/images/characterCustomizer/body_arms.png";
import body5 from "@/assets/images/characterCustomizer/head_front_5.png";

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

const HEADS: [StaticImageData, string][] = [
	[head1, "Kitty Headphones"],
	[head2, "Among Us"],
	[head3, "LED Mask"],
	[head4, "Hood"],
];
const BODIES: [StaticImageData, string][] = [
	[body1, "Number"],
	[body3, "Coat"],
	[body4, "Robotic Arms"],
	[body5, "Necklace"],
];
const FEET: [StaticImageData, string][] = [
	[feet1, "Hover Boots"],
	[feet2, "Black Boots"],
	[feet3, "Astro Boots"],
	[feet4, "Neon Anklets"],
	[feet6, "Cyber Anklets"],
];
const COMPANIONS: [StaticImageData, string][] = [
	[companion1, "Drone"],
	[companion2, "Robopetr"],
	[companion3, "Holo"],
	[companion4, "Tether"],
];

const imageWidth = 600;

const CharacterDisplay = ({
	headIndex,
	bodyIndex,
	feetIndex,
	companionIndex,
}: {
	headIndex: number;
	bodyIndex: number;
	feetIndex: number;
	companionIndex: number;
}) => {
	return (
		<div className="relative w-full border-white border-4 rounded-xl bg-gradient-to-b from-[#02031D] via-[#090D83] via-54% to-[#090D83]">
			<div className="h-[400px] w-full flex items-center justify-center">
				{/* Perspective Grid Layer */}
				<div className="absolute bottom-0 h-full w-full inset-0 z-0">
					<Image
						src={perspectiveGrid}
						alt="Perspective Grid"
						className="absolute bottom-0 w-full"
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
				</div>
			</div>
			<div className="flex flex-col items-center justify-center mb-8">
				<div className="flex flex-col">
					<div>
						<p className="font-display">
							<span className="text-turquoise">Head:</span>{" "}
							<span className="text-white">{HEADS[headIndex][1]}</span>
						</p>
					</div>
					<div>
						<p className="font-display">
							<span className="text-turquoise">Body:</span>{" "}
							<span className="text-white">{BODIES[bodyIndex][1]}</span>
						</p>
					</div>
					<div>
						<p className="font-display">
							<span className="text-turquoise">Feet:</span>{" "}
							<span className="text-white">{FEET[feetIndex][1]}</span>
						</p>
					</div>
					<div>
						<p className="font-display">
							<span className="text-turquoise">Companion:</span>{" "}
							<span className="text-white">
								{COMPANIONS[companionIndex][1]}
							</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CharacterDisplay;
