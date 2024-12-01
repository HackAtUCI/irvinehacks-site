"use client";

import { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";

import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import haveApplicationsOpened from "@/lib/utils/haveApplicationsOpened";
import View from "@/components/canvas/View";
import Button from "@/lib/components/Button/Button";
import LandingUnopened from "./LandingUnopened";
import LandingUnlocked from "./LandingUnlocked";

import styles from "./Landing.module.css";

const Landing = () => {
	const deadlinePassed = hasDeadlinePassed();
	const applicationsOpened = haveApplicationsOpened();

	if (deadlinePassed) return <LandingUnopened />;
	if (applicationsOpened) return <LandingUnlocked />;
	return <LandingUnlocked />;
};

export default Landing;
