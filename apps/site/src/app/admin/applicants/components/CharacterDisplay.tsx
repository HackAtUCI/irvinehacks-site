import Image, { StaticImageData } from "next/image";

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
		<div
			style={{
				position: "relative",
				width: "100%",
				border: "4px solid white",
				borderRadius: "0.75rem",
				background:
					"linear-gradient(to bottom, #02031D 0%, #090D83 54%, #090D83 100%)",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					height: "400px",
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{/* Main Content Area */}
				<div
					style={{
						position: "relative",
						zIndex: 10,
						width: "100%",
						maxWidth: "800px",
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{/* Character Composite */}
					<div
						style={{
							position: "relative",
							zIndex: 30,
							width: "400px",
							height: "400px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							marginTop: "2.5rem",
						}}
					>
						{/* Blank Tail (Base Layer) */}
						<div
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								bottom: 0,
								left: "-20%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Image
								src={blankTail}
								alt="Base Tail"
								width={imageWidth}
								height={imageWidth}
								style={{ objectFit: "contain" }}
								priority
							/>
						</div>
						{/* Blank Body (Base Layer) */}
						<div
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								bottom: 0,
								left: "-20%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Image
								src={blankBody}
								alt="Base Body"
								width={imageWidth}
								height={imageWidth}
								style={{ objectFit: "contain" }}
								priority
							/>
						</div>
						{/* Blank Head (Base Layer) */}
						<div
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								bottom: 0,
								left: "-20%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Image
								src={blankHead}
								alt="Base Head"
								width={imageWidth}
								height={imageWidth}
								style={{ objectFit: "contain" }}
								priority
							/>
						</div>
						{/* Feet (Customizable Layer) */}
						<div
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								bottom: 0,
								left: "-20%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Image
								src={FEET[feetIndex][0]}
								alt="Character Feet"
								width={imageWidth}
								height={imageWidth}
								style={{ objectFit: "contain" }}
								priority
							/>
						</div>
						{/* Body (Customizable Layer) */}
						<div
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								bottom: 0,
								left: "-20%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Image
								src={BODIES[bodyIndex][0]}
								alt="Character Body"
								width={imageWidth}
								height={imageWidth}
								style={{ objectFit: "contain" }}
								priority
							/>
						</div>
						{/* Head (Customizable Layer) */}
						<div
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								bottom: 0,
								left: "-20%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Image
								src={HEADS[headIndex][0]}
								alt="Character Head"
								width={imageWidth}
								height={imageWidth}
								style={{ objectFit: "contain" }}
								priority
							/>
						</div>
						{/* Companion (Customizable Layer - Top Layer) */}
						<div
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								bottom: 0,
								left: "-20%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Image
								src={COMPANIONS[companionIndex][0]}
								alt="Character Companion"
								width={imageWidth}
								height={imageWidth}
								style={{ objectFit: "contain" }}
								priority
							/>
						</div>
					</div>
				</div>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					marginBottom: "2rem",
				}}
			>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<div>
						<p style={{ marginBottom: "1rem" }}>
							<span style={{ color: "#00ffff" }}>Head:</span>{" "}
							<span style={{ color: "white" }}>{HEADS[headIndex][1]}</span>
						</p>
					</div>
					<div>
						<p style={{ marginBottom: "1rem" }}>
							<span style={{ color: "#00ffff" }}>Body:</span>{" "}
							<span style={{ color: "white" }}>{BODIES[bodyIndex][1]}</span>
						</p>
					</div>
					<div>
						<p style={{ marginBottom: "1rem" }}>
							<span style={{ color: "#00ffff" }}>Feet:</span>{" "}
							<span style={{ color: "white" }}>{FEET[feetIndex][1]}</span>
						</p>
					</div>
					<div>
						<p style={{ marginBottom: "1rem" }}>
							<span style={{ color: "#00ffff" }}>Companion:</span>{" "}
							<span style={{ color: "white" }}>
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
