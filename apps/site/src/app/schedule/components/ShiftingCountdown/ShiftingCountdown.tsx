"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import BarLoader from "../BarLoader";
import clsx from "clsx";
import { Fireworks } from "@fireworks-js/react";

import styles from "./ShiftingCountdown.module.scss";

// NOTE: Change this date to whatever date you want to countdown to :)
// const HACKING_STARTS = "2024-01-26T18:00:00.000";
const HACKING_ENDS = "2024-01-28T24:00:00.000";
const HACKING_STARTS = "2023-12-06T22:23:00.000"; // Test when countdown ends
// HACKING_STARTS.setSeconds(10);
// const HACKING_ENDS = new Date();

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const ShiftingCountdown = () => {
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const [showTimer, setShowTimer] = useState(false);
	const [showFireworks, setShowFireworks] = useState(false);
	const [timerLabel, setTimerLabel] = useState("Hacking Starts");

	const [remaining, setRemaining] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	useEffect(() => {
		intervalRef.current = setInterval(handleCountdown, 1000);

		return () => clearInterval(intervalRef.current || undefined);
	}, []);

	const handleCountdown = () => {
		const now = new Date();

		let end = new Date(HACKING_STARTS);

		if (now >= new Date(HACKING_STARTS)) {
			setTimerLabel("Hacking Ends");
			end = new Date(HACKING_ENDS);
		}

		const distance = Math.max(+end - +now, 0);

		const days = Math.floor(distance / DAY);
		const hours = Math.floor((distance % DAY) / HOUR);
		const minutes = Math.floor((distance % HOUR) / MINUTE);
		const seconds = Math.floor((distance % MINUTE) / SECOND);

		if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) {
			// triggers when HACKING_STARTS timer ends and HACKING_ENDS timer ends
			setShowFireworks(true);
		}

		setRemaining({
			days,
			hours,
			minutes,
			seconds,
		});
		setShowTimer(true);
	};

	return (
		<>
			<div className="p-4">
				{!showTimer ? (
					<div className="w-full flex justify-center">
						<BarLoader />
					</div>
				) : (
					<>
						<span
							className={clsx(
								"w-full flex justify-center text-5xl p-4",
								styles.text,
							)}
						>
							{timerLabel}
						</span>
						<div className="w-full max-w-5xl mx-auto flex items-center">
							<CountdownItem num={remaining.days} text="days " />
							<CountdownItem num={remaining.hours} text="hours" />
							<CountdownItem
								num={remaining.minutes}
								text="minutes"
							/>
							<CountdownItem
								num={remaining.seconds}
								text="seconds"
							/>
						</div>
					</>
				)}
			</div>
			{showFireworks && (
				<div className="flex justify-center z-20">
					<Fireworks
						className="w-full h-full absolute"
						options={{
							opacity: 0.1,
						}}
					/>
				</div>
			)}
		</>
	);
};

const CountdownItem = ({ num, text }: { num: number; text: string }) => {
	return (
		<motion.div className="font-mono w-1/4 h-24 md:h-36 flex flex-col gap-1 md:gap-2 items-center justify-center border-slate-200">
			<div className="w-full p-1 text-center relative overflow-hidden">
				<AnimatePresence mode="popLayout">
					<motion.span
						key={num}
						initial={{ y: "100%" }}
						animate={{ y: "0%" }}
						exit={{ y: "-100%" }}
						transition={{ ease: "backIn", duration: 0.75 }}
						className={clsx(
							"block text-2xl md:text-4xl lg:text-6xl xl:text-7xl text-white font-medium",
							styles.text,
						)}
					>
						{num}
					</motion.span>
				</AnimatePresence>
			</div>
			<span
				className={clsx(
					"text-xs md:text-sm lg:text-base font-light text-slate-500",
					styles.subtext,
				)}
			>
				{text}
			</span>
		</motion.div>
	);
};

export default ShiftingCountdown;
