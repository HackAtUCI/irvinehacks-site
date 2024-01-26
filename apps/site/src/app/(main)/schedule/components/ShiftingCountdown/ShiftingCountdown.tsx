"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import BarLoader from "../BarLoader";
import clsx from "clsx";
import { Fireworks } from "@fireworks-js/react";

import styles from "./ShiftingCountdown.module.scss";

// NOTE: Change this date to whatever date you want to countdown to :)
const HACKING_STARTS = Date.UTC(2024, 0, 27, 2, 0, 0); // 1/26 at 6pm PST
const HACKING_ENDS = Date.UTC(2024, 0, 28, 20, 0, 0); // 1/28 at 12pm PST

// Testing:
// const HACKING_STARTS = "2024-01-25T01:18:00.000";
// const HACKING_ENDS = "2024-01-25T01:19:00.000";

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

		if (
			days === 0 &&
			hours === 0 &&
			minutes === 0 &&
			seconds === 0 &&
			now >= new Date(HACKING_ENDS)
		) {
			// triggers when HACKING_ENDS timer ends
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
						<div className="w-full mx-auto flex items-center justify-center gap-x-3">
							<CountdownItem num={countdown.days} text="days" />
							<CountdownItem num={countdown.hours} text="hours" />
							<CountdownItem num={countdown.minutes} text="minutes" />
							<CountdownItem num={countdown.seconds} text="seconds" />
						</div>
						<span
							className={clsx(
								"w-full flex justify-center text-3xl p-4 md:text-5xl flex-wrap whitespace-nowrap lg:mb-5",
								styles.text,
							)}
						>
							{countdown.label}
						</span>
					</>
				)}
			</div>
			{countdown.showFireworks && (
				<div className="flex justify-center">
					<Fireworks
						className="w-full h-full absolute pointer-events-none"
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
