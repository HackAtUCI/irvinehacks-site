"use client";

import { useRef } from "react";
import Image from "next/image";
import LandingBackground from "@/assets/backgrounds/landing-background.png";

import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import haveApplicationsOpened from "@/lib/utils/haveApplicationsOpened";

import styles from "./Landing.module.css";
import About from "./About/About";

const Landing = () => {
	const deadlinePassed = hasDeadlinePassed();
	const applicationsOpened = haveApplicationsOpened();
	const scrollTo = useRef<null | HTMLDivElement>(null);

	const applyClick = () => {
		scrollTo.current?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<section className="bg-[#00001c]">
				<div
					className={`min-h-screen absolute overflow-hidden z-10 w-full flex flex-col items-center justify-center`}
				>
					<div className="text-center relative p-10 flex flex-col items-center justify-center min-w-[200px]">
						<h2 className="text-xl md:text-2xl mb-5 z-1">
							February 27th - March 1st, 2026
						</h2>
						<h1
							className={`${styles.headingDropShadow} font-heading text-6xl md:text-7xl mb-5 max-sm:text-5xl`}
						>
							IRVINEHACKS
						</h1>
					</div>
				</div>
				<div className="min-h-screen">
					<Image
						src={LandingBackground}
						alt="landing background"
						className="bg-[#00001c] w-screen"
					/>
				</div>

				<About />
			</section>
			<div ref={scrollTo} />
		</>
	);
};

export default Landing;
