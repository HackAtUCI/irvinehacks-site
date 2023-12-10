"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import BarLoader from "../BarLoader";
import clsx from "clsx";
import { Fireworks } from "@fireworks-js/react";

import styles from "./ShiftingCountdown.module.scss";

// NOTE: Change this date to whatever date you want to countdown to :)
const HACKING_STARTS = "2024-01-26T18:00:00.000";
const HACKING_ENDS = "2024-01-28T24:00:00.000";

// Testing:
// const HACKING_STARTS = "2023-12-09T21:42:00.000";
// const HACKING_ENDS = "2023-12-09T21:44:00.000";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const ShiftingCountdown = () => {
	const [countdown, setCountdown] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		showTimer: false,
		showFireworks: false,
		label: "Hacking Starts",
	});

	useEffect(() => {
		const intervalRef = setInterval(handleCountdown, 1000);
		return () => clearInterval(intervalRef || undefined);
	}, []);

	const handleCountdown = () => {
		const now = new Date();

		let end = new Date(HACKING_STARTS);

		if (now >= new Date(HACKING_STARTS)) {
			setCountdown((prev) => {
				return { ...prev, label: "Hacking Ends" };
			});
			end = new Date(HACKING_ENDS);
		}

		const distance = Math.max(+end - +now, 0);

		const days = Math.floor(distance / DAY);
		const hours = Math.floor((distance % DAY) / HOUR);
		const minutes = Math.floor((distance % HOUR) / MINUTE);
		const seconds = Math.floor((distance % MINUTE) / SECOND);

		if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) {
			// triggers when HACKING_STARTS timer ends and HACKING_ENDS timer ends
			setCountdown((prev) => {
				return { ...prev, showFireworks: true };
			});
		}

		setCountdown((prev) => {
			return {
				...prev,
				days: days,
				hours: hours,
				minutes: minutes,
				seconds: seconds,
			};
		});
		setCountdown((prev) => {
			return { ...prev, showTimer: true };
		});
	};

	return (
		<>
			<div className="p-4">
				{!countdown.showTimer ? (
					<div className="w-full flex justify-center">
						<BarLoader />
					</div>
				) : (
					<>
						<span
							className={clsx(
								"w-full flex justify-center text-3xl p-4 md:text-5xl flex-wrap whitespace-nowrap lg:mb-5",
								styles.text,
							)}
						>
							{countdown.label}
						</span>
						<div className="w-full mx-auto flex items-center justify-center gap-x-3">
							<CountdownItem num={countdown.days} text="days" />
							<CountdownItem num={countdown.hours} text="hours" />
							<CountdownItem
								num={countdown.minutes}
								text="minutes"
							/>
							<CountdownItem
								num={countdown.seconds}
								text="seconds"
							/>
						</div>
					</>
				)}
			</div>
			{countdown.showFireworks && (
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
		<motion.div className="font-mono w-25 lg:w-1/6 h-24 md:h-36 flex flex-col gap-1 md:gap-2 items-center justify-center border-slate-200 p-5 flex-shrink-0 whitespace-normal">
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
