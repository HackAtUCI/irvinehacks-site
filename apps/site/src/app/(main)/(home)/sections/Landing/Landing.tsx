"use client";

import { Suspense, useRef, useState } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { motion } from "framer-motion";
import Image from "next/image";
import View from "@/components/canvas/View";
import Button from "@/lib/components/Button/Button";

import About from "./About/About";

import Cliff from "@/assets/images/anteater_cliff.png";
import Castle from "@/assets/images/castle_island.png";
import Cloud1 from "@/assets/images/cloud_bg_1.png";
import Cloud2 from "@/assets/images/cloud_bg_2.png";
import BgPillar from "@/assets/images/pillars.png";
import FarPillars from "@/assets/images/clouds_distance_pillars.png";
import BgCastle from "@/assets/images/background_castle.png";

import styles from "./Landing.module.css";

const Landing = () => {
	const [loaded, setLoaded] = useState(0);
	const scrollTo = useRef<null | HTMLDivElement>(null);

	const applyClick = () => {
		scrollTo.current?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<section
				className={`${
					styles.landingBackground
				} min-h-screen pb-[200px] relative overflow-hidden max-lg:h-[1500px] ${
					loaded < 8 ? "blur-sm" : ""
				} duration-500`}
			>
				<div
					className={`flex flex-col items-center relative w-screen aspect-[3/4] max-h-[240vh] max-lg:h-[1100px] max-sm:h-[850px]`}
				>
					<View className="absolute w-full h-full">
						<Suspense fallback={null}>
							<PerspectiveCamera makeDefault position={[0, -0.1, 1]} />
						</Suspense>
					</View>
					<div
						className={`${styles.titleAnim} absolute z-10 w-full h-[50%] flex flex-col items-center justify-center opacity-0`}
					>
						<div className="text-center relative p-10 flex flex-col items-center justify-center min-w-[200px]">
							<div
								className={`${styles.textDropshadow} w-full h-full absolute top-0 z-[-1]`}
							/>
							<h2 className="font-display text-xl md:text-2xl font-bold mb-5 z-1">
								January 24-26, 2025
							</h2>
							<h1 className="font-display text-6xl md:text-7xl font-bold mb-5 max-sm:text-5xl">
								IrvineHacks
							</h1>
						</div>
						<div onClick={applyClick}>
							<Button className="font-display" text="Apply" />
						</div>
					</div>
					<div
						className={`absolute w-full h-full flex flex-col items-center max-h-[1500px]`}
					>
						<Image
							src={Cloud2}
							priority
							fill={true}
							alt="clouds"
							className="absolute top-[-200px] min-w-[1800px] w-full max-lg:min-w-[150%]"
							onLoad={() => setLoaded((loaded) => loaded + 1)}
						/>

						<div className="absolute min-w-[570px] w-full max-h-[2000px] overflow-hidden">
							<Image
								src={FarPillars}
								priority
								alt="background pillars"
								className="absolute min-w-[570px] w-full"
								onLoad={() => setLoaded((loaded) => loaded + 1)}
							/>
						</div>

						<Image
							src={BgCastle}
							priority
							alt="background castle"
							className="absolute opacity-80 min-w-[520px] w-full"
						/>

						<div className="w-full h-full absolute min-w-[520px]">
							<motion.div
								initial={{ y: 200 }}
								animate={{ y: 0, transition: { duration: 3 } }}
							>
								<Image
									src={BgPillar}
									priority
									alt="background pillars"
									className="w-full"
									onLoad={() => setLoaded((loaded) => loaded + 1)}
								/>
							</motion.div>
						</div>

						<motion.div
							initial={{ y: -170, scale: 0.7 }}
							animate={{ y: 0, scale: 1.5, transition: { duration: 3 } }}
						>
							<Image
								src={Castle}
								priority
								alt="castle"
								className="w-full max-w-6xl mt-[100px] min-w-[520px]"
								onLoad={() => setLoaded((loaded) => loaded + 1)}
							/>
						</motion.div>

						<Image
							src={Cliff}
							priority
							alt="anteater cliff"
							className={`absolute top-[31%] max-lg:top-[33%] min-w-[520px] w-full`}
							onLoad={() => setLoaded((loaded) => loaded + 1)}
						/>
						<Image
							src={Cloud1}
							priority
							alt="clouds"
							className={`${styles.cloudAnim} absolute top-[-280px] min-w-[1800px] max-lg:min-w-[150%] opacity-50 w-full`}
							onLoad={() => setLoaded((loaded) => loaded + 1)}
						/>
						<Image
							src={Cloud1}
							priority
							alt="clouds"
							className={`${styles.cloudAnim} absolute top-28 min-w-[1800px] w-full max-lg:min-w-[150%] max-lg:top-0`}
							onLoad={() => setLoaded((loaded) => loaded + 1)}
						/>
					</div>
					<Image
						src={Cloud2}
						priority
						alt="foreground clouds"
						className={`${styles.bottomCloud} absolute bottom-[200px] md:bottom-16 xxl:bottom-0 w-full`}
						onLoad={() => setLoaded((loaded) => loaded + 1)}
					/>
				</div>
				<About />
			</section>
			<div ref={scrollTo} />
		</>
	);
};

export default Landing;
