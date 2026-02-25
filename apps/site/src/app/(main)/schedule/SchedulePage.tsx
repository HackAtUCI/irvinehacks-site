/* eslint-disable no-mixed-spaces-and-tabs */
"use client";

import { useEffect, useState } from "react";
import DesktopSchedulePage from "./sections/desktop/DesktopSchedulePage";
import MobileSchedulePage from "./sections/mobile/ScheduleMobile";
import EventProps from "./components/EventProps";

interface ScheduleProps {
	schedule: EventProps[][];
}

export default function SchedulePage({ schedule }: ScheduleProps) {
	const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

	useEffect(() => {
		// Tailwind lg breakpoint = 1024px by default
		const mediaQuery = window.matchMedia("(min-width: 1024px)");

		const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
			setIsDesktop(e.matches);
		};

		// Set initial value
		handleChange(mediaQuery);

		// Listen for changes
		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	// Prevent hydration mismatch
	if (isDesktop === null) {
		return null; // or a loading spinner
	}

	return isDesktop ? (
		<DesktopSchedulePage schedule={schedule} />
	) : (
		<MobileSchedulePage schedule={schedule} />
	);
}
