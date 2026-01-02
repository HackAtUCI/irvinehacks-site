"use client";

import { useRef } from "react";
import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import haveApplicationsOpened from "@/lib/utils/haveApplicationsOpened";

import styles from "./Landing.module.css";

const Landing = () => {
	const deadlinePassed = hasDeadlinePassed();
	const applicationsOpened = haveApplicationsOpened();
	const scrollTo = useRef<null | HTMLDivElement>(null);

	const applyClick = () => {
		scrollTo.current?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<section
				className={`${
					styles.landingBackground
				} min-h-screen pb-[200px] relative overflow-hidden max-lg:h-[1500px]`}
			>
				<div
					className={`flex flex-col items-center relative w-screen aspect-[3/4] max-h-[240vh] max-lg:h-[1100px] max-sm:h-[850px]`}
				>
					<div
						className={`${styles.titleAnim} absolute z-10 w-full h-[50%] sm:h-[40%] flex flex-col items-center justify-center opacity-0`}
					>
						<div className="text-center relative p-10 flex flex-col items-center justify-center min-w-[200px]">
							<div
								className={`${styles.textDropshadow} w-full h-full absolute top-0 z-[-1]`}
							/>
							<h2 className="text-xl md:text-2xl mb-5 z-1">
								February 27th - March 1st, 2026
							</h2>
							<h1 className="font-heading text-6xl md:text-7xl mb-5 max-sm:text-5xl">
								IRVINEHACKS
							</h1>
						</div>
					</div>
				</div>
			</section>
			<div ref={scrollTo} />
		</>
	);
};

export default Landing;
