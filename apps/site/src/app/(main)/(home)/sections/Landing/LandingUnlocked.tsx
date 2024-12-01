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
import QuestBox from "@/assets/images/Desktop/text_box_with_title.svg";
import LgStar from "@/assets/images/Desktop/large_star.svg";
import SmStar from "@/assets/images/Desktop/small_star.svg";

import styles from "./Landing.module.css";
import Image from "next/image";

const LandingUnlocked = () => {
	return (
		<section className={`${styles.landingUnlockedBackground} min-h-screen`}>
			<div
				className={`flex flex-col items-center overflow-hidden relative w-screen aspect-[3/4] max-h-[1750px] max-lg:h-[1100px] max-sm:h-[850px]`}
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
							January 24-26, 2025
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
						className="absolute min-w-[570px]"
					/>

					<Image
						src={BgCastle}
						alt="background castle"
						className="absolute opacity-80 min-w-[520px]"
					/>

					<div className="w-full h-full absolute min-w-[520px]">
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
						className={`absolute top-[31%] max-lg:top-[33%] min-w-[520px]`}
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
				<Image
					src={Cloud2}
					alt="clouds"
					className={`absolute bottom-[-300px] min-w-[1800px] max-lg:min-w-[150%]`}
				/>
				<div className="w-full absolute bottom-0 flex justify-center aspect-[12/5]">
					<Image src={LgStar} alt="*" className="absolute top-[30%] left-10" />
					<Image
						src={SmStar}
						alt="*"
						className="absolute bottom-[30%] left-[7%]"
					/>

					<Image src={LgStar} alt="*" className="absolute bottom-0 left-20" />

					<Image src={LgStar} alt="*" className="absolute top-[40%] right-10" />
					<Image
						src={SmStar}
						alt="*"
						className="absolute bottom-[20%] right-[7%]"
					/>
					<div className="absolute bottom-0 flex flex-col items-center w-[75%] max-w-[1200px] min-w-[750px] pb-10">
						<p className="font-display text-3xl md:text-4xl font-bold mb-10">
							3 Days, 400+ Hackers, $5,000+ in Prizes
						</p>

						<div className="h-auto w-auto relative flex justify-center">
							<div className="w-full h-full bg-white absolute mt-5 left-5"></div>
							<Image src={QuestBox} alt="quest box" className="relative z-0" />
							<p className="font-display text-3xl max-lg:text-xl mt-3 absolute">
								Quest Unlocked
							</p>
							<div className="w-full h-full absolute text-center flex justify-center items-center z-1">
								<div className="w-[80%] h-[80%] flex flex-col justify-center items-center relative">
									<p className="font-display text-2xl max-xl:text-base max-2xl:text-xl mt-3">
										IrvineHacks is the largest collegiate hackathon in Orange
										County and we continue expanding and improving our event
										every year. Our focus? - Enhance the community around us by
										giving students the platform to unleash their creativity in
										an environment of forward thinking individuals.
									</p>
									<p className="font-display text-2xl max-xl:text-base max-2xl:text-xl mt-3">
										This year, IrvineHacks will take place the weekend of
										January 26th to 28th. The event will be 100% in-person
										during the day (not overnight). Free workshops, socials,
										food, and swag will be provided
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default LandingUnlocked;
