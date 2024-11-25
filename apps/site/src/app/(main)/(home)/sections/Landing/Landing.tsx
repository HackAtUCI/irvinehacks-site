"use client";

import { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";

import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import haveApplicationsOpened from "@/lib/utils/haveApplicationsOpened";
import View from "@/components/canvas/View";
import Button from "@/lib/components/Button/Button";

import styles from "./Landing.module.css";

const Landing = () => {
	const deadlinePassed = hasDeadlinePassed();
	const applicationsOpened = haveApplicationsOpened();

	return (
		<section className={styles.landingBackground}>
			<View className="absolute w-full h-full">
				<Suspense fallback={null}>
					<PerspectiveCamera makeDefault position={[0, -0.1, 1]} />
				</Suspense>
			</View>
			<div className="flex flex-col justify-center items-center min-h-screen text-center overflow-x-hidden relative">
				<p className="font-display text-2xl md:text-3xl">January 24&ndash;26</p>
				<h1 className="font-display text-4xl md:text-5xl font-bold mb-5">
					IrvineHacks 2025
				</h1>
				{deadlinePassed ? (
					<Button className="z-10" text="Applications have closed!" disabled />
				) : applicationsOpened ? (
					<Button className="z-10" text="Apply" href="/apply" />
				) : (
					<Button className="z-10" text="Coming Soon..." disabled />
				)}
			</div>
		</section>
	);
};

export default Landing;
