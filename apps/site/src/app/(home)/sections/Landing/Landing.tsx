"use client";

import Button from "@/lib/components/Button/Button";
import styles from "./Landing.module.css";

import { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { View } from "@/components/canvas/View";
import Fireflies from "../../components/Fireflies";

const Landing = () => {
	return (
		<section className={styles.landingSection}>
			<View className="h-full w-full absolute">
				<Suspense fallback={null}>
					<Fireflies />
					<PerspectiveCamera makeDefault position={[0.1, 0.1, 0.6]} />
				</Suspense>
			</View>
			<div className={styles.landingGroup}>
				<h1 className="font-display">IrvineHacks 2024</h1>
				<p className="font-display">January 26&ndash;28</p>
				<Button
					text="Stay updated"
					href="https://uci.us13.list-manage.com/subscribe?u=5976872928cd5681fbaca89f6&id=93333e11eb"
				/>
			</div>
		</section>
	);
};

export default Landing;
