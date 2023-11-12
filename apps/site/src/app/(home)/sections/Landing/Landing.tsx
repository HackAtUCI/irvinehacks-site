"use client";

import { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";

import { View } from "@/components/canvas/View";
import Button from "@/lib/components/Button/Button";
import Fireflies from "../../components/Fireflies";

import landingBackground from "@/assets/backgrounds/landing-background.jpg";

const Landing = () => {
	return (
		<section
			style={{ backgroundImage: `url(${landingBackground.src})` }}
			className="bg-auto xl:bg-cover bg-no-repeat bg-center"
		>
			<View className="h-full w-full absolute">
				<Suspense fallback={null}>
					<Fireflies />
					<PerspectiveCamera makeDefault position={[0.1, 0.1, 0.6]} />
				</Suspense>
			</View>
			<div className="flex flex-col justify-center items-center min-h-screen text-center">
				<h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
					IrvineHacks 2024
				</h1>
				<p className="font-display text-2xl md:text-3xl">
					January 26&ndash;28
				</p>
				<Button
					className="z-10"
					text="Stay updated"
					href="https://uci.us13.list-manage.com/subscribe?u=5976872928cd5681fbaca89f6&id=93333e11eb"
				/>
			</div>
		</section>
	);
};

export default Landing;
