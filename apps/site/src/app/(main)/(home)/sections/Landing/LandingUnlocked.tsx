"use client";

import { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";

import View from "@/components/canvas/View";
import Button from "@/lib/components/Button/Button";

import { motion } from "framer-motion";

import Cliff from "@/assets/images/Desktop/anteater_cliff.png";
import Castle from "@/assets/images/Desktop/castle_island.png";
import Cloud1 from "@/assets/images/Desktop/cloud_bg_1.png";
import Cloud2 from "@/assets/images/Desktop/cloud_bg_2.png";
import BgPillar from "@/assets/images/Desktop/pillars.png";
import FarPillars from "@/assets/images/Desktop/clouds_distance_pillars.png";
import BgCastle from "@/assets/images/Desktop/background_castle.png";

import styles from "./Landing.module.css";
import Image from "next/image";

const LandingUnlocked = () => {
	return (
		<section
			className={`flex flex-col items-center overflow-hidden relative h-[1500px] max-lg:h-[1100px] max-sm:h-[600px]`}
		>
			<View className="absolute w-full h-full">
				<Suspense fallback={null}>
					<PerspectiveCamera makeDefault position={[0, -0.1, 1]} />
				</Suspense>
			</View>
			<div
				className={`${styles.titleAnim} absolute z-10 w-full h-[62%] flex flex-col items-center justify-center opacity-0`}
			>
				<div className="text-center relative p-10 flex flex-col items-center justify-center min-w-[200px]">
					<div
						className={`${styles.textDropshadow} w-full h-full absolute top-0 z-[-1]`}
					/>
					<h2 className="font-display text-xl md:text-2xl font-bold mb-5 z-1">
						February x-x, 2024
					</h2>
					<h1 className="font-display text-6xl md:text-7xl font-bold mb-5">
						IrvineHacks
					</h1>
				</div>
				<div>
					<Button className="font-display" text="Apply" href="/apply" />
				</div>
			</div>
			<div className="absolute w-full h-full flex flex-col items-center overflow-hidden max-h-[1500px]">
				<Image
					src={Cloud2}
					fill={true}
					alt="clouds"
					className="absolute top-[-200px] min-w-[1800px] max-lg:min-w-[150%]"
				/>
				<Image
					src={FarPillars}
					alt="background pillars"
					className={`absolute`}
				/>

				<Image
					src={BgCastle}
					alt="background pillars"
					className="absolute opacity-80"
				/>

				<div className="w-full h-full absolute">
					<motion.div
						initial={{ y: 200 }}
						animate={{ y: 0, transition: { duration: 3 } }}
					>
						<Image src={BgPillar} alt="background pillars" />
					</motion.div>
				</div>

				<motion.div
					initial={{ y: -170, scale: 0.7 }}
					animate={{ y: 0, scale: 1.1, transition: { duration: 3 } }}
				>
					<Image
						src={Castle}
						alt="castle"
						className="z-0 w-full max-w-6xl mt-10 min-w-[520px]"
					/>
				</motion.div>

				<Image
					src={Cliff}
					alt="anteater cliff"
					className="absolute top-[31%] max-lg:top-[33%] min-w-[520px]"
				/>
				<Image
					src={Cloud1}
					alt="clouds"
					className={`${styles.cloudAnim} absolute top-[-280px] min-w-[1800px] max-lg:min-w-[150%] opacity-50`}
				/>
				<Image
					src={Cloud1}
					alt="clouds"
					className={`${styles.cloudAnim} absolute top-28 min-w-[1800px] max-lg:min-w-[150%] max-lg:top-0`}
				/>
			</div>
		</section>
	);
};

export default LandingUnlocked;
