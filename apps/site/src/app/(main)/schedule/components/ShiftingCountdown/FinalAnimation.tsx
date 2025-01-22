"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";

import Sprite1 from "@/assets/images/hacker_sprite.png";
import Sprite2 from "@/assets/images/mentor_sprite.png";
import Sprite3 from "@/assets/images/volunteer_sprite.png";

import styles from "./ShiftingCountdown.module.scss";
import Image from "next/image";

const finalAnimVariants = {
	initial: {
		y: "100%",
	},
	animate: {
		y: "0%",
		transition: {
			duration: 0.7,
		},
	},
} as Variants;

const exitAnim = {
	opacity: 0,
	y: "-100px",
	filter: "blur(10px)",
	transition: { ease: "easeIn", duration: 0.2 },
};

const initialState = {
	opacity: 0,
	y: "100px",
	filter: "blur(10px)",
};

const introAnim = {
	opacity: 1,
	y: "0px",
	filter: "blur(0px)",
	transition: { ease: "easeIn", duration: 0.2 },
};

const FinalAnimation = () => {
	const [animationProperties, setAnimationProperties] = useState({
		first: true,
		second: false,
		third: false,
	});

	useEffect(() => {
		setTimeout(() => {
			setAnimationProperties((anim) => {
				return { ...anim, first: false };
			});
		}, 2000);
		setTimeout(() => {
			setAnimationProperties((anim) => {
				return { ...anim, second: true };
			});
		}, 2500);
		setTimeout(() => {
			setAnimationProperties((anim) => {
				return { ...anim, second: false };
			});
		}, 4500);
		setTimeout(() => {
			setAnimationProperties((anim) => {
				return { ...anim, third: true };
			});
		}, 5000);
		setTimeout(() => {
			setAnimationProperties((anim) => {
				return { ...anim, third: false };
			});
		}, 7000);
	}, []);

	return (
		<motion.div
			className="fixed w-[100vw] h-[100vh] bg-[rgb(0,0,0,0.8)] top-0 left-0 z-10"
			initial={{ opacity: 0, filter: "blur(10px)" }}
			animate={{
				opacity: 1,
				filter: "blur(0px)",
				transition: { ease: "easeIn", duration: 0.7 },
			}}
		>
			<AnimatePresence>
				{animationProperties.first && (
					<motion.div key="exit" exit={exitAnim}>
						<motion.div
							transition={{
								staggerChildren: 0.75,
							}}
							initial="initial"
							animate="animate"
							className="relative overflow-hidden"
						>
							<div className="fixed top-0 left-0 text-9xl font-display w-full h-[100vh] flex justify-center items-center">
								<div className="overflow-hidden flex gap-20">
									<motion.div
										variants={finalAnimVariants}
										className={styles.text}
									>
										!
									</motion.div>
									<motion.div
										variants={finalAnimVariants}
										className={styles.text}
									>
										!
									</motion.div>
									<motion.div
										variants={finalAnimVariants}
										className={styles.text}
									>
										!
									</motion.div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
			<AnimatePresence>
				{animationProperties.second && (
					<motion.div
						key="exit1"
						initial={initialState}
						animate={introAnim}
						exit={exitAnim}
						className={`fixed top-0 left-0 text-7xl font-display w-full h-[100vh] flex flex-col gap-10 justify-center items-center text-center`}
					>
						<Image src={Sprite1} alt="hacker thanks!" width={200} />
						<div>Thank you all!</div>
						<div className="flex">
							<Image src={Sprite2} alt="mentor thanks!" width={200} />
							<Image src={Sprite3} alt="volunteer thanks!" width={200} />
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{animationProperties.third && (
					<motion.div
						key="exit1"
						initial={initialState}
						animate={introAnim}
						exit={exitAnim}
						className={`fixed top-0 left-0 text-7xl font-display w-full h-[100vh] flex flex-col gap-10 justify-center items-center text-center`}
					>
						<Image src={Sprite1} alt="hacker thanks!" width={200} />
						<div>Hacking has Ended!</div>
						<div className="flex">
							<Image src={Sprite2} alt="mentor thanks!" width={200} />
							<Image src={Sprite3} alt="volunteer thanks!" width={200} />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default FinalAnimation;
