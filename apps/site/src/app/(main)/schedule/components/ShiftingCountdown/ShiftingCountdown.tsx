"use client";

import { useEffect, useState } from "react";

import CountdownItem from "./CountdownItem";

// NOTE: Change this date to whatever date you want to countdown to :)
const HACKING_STARTS = Date.UTC(2026, 1, 28, 5, 0, 0); // 2/26 at 9pm PST
const HACKING_ENDS = Date.UTC(2026, 2, 1, 17, 0, 0); // 3/1 at 9am PST (36 hours later)

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const ShiftingCountdown = () => {
	const calculateCountdown = () => {
		const now = new Date();
		let end = new Date(HACKING_STARTS);
		let label = "Hacking starts";

		if (now >= end) {
			label = "Hacking ends";
			end = new Date(HACKING_ENDS);
		}

		const distance = Math.max(+end - +now, 0);
		const days = Math.floor(distance / DAY);
		const hours = Math.floor((distance % DAY) / HOUR);
		const minutes = Math.floor((distance % HOUR) / MINUTE);
		const seconds = Math.floor((distance % MINUTE) / SECOND);

		return { days, hours, minutes, seconds, label };
	};

	const [countdown, setCountdown] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		label: "Loading...",
	});

	// Check mount to fix hydration issue
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
		setCountdown(calculateCountdown());
		const intervalRef = setInterval(() => {
			setCountdown(calculateCountdown());
		}, 1000);
		return () => clearInterval(intervalRef || undefined);
	}, []);

	if (!isMounted) return null;

	const hasEnded = new Date() > new Date(HACKING_ENDS);

	return (
		<div className="flex items-center justify-center py-32 p-4 lg:p-8">
			<div className="w-full max-w-6xl">
				<div className="bg-gradient-to-br from-[#2B3FD9]/90 via-[#1E2B8F]/90 to-[#0F1654]/90 rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 md:p-16 backdrop-blur-sm border border-cyan-400/20 shadow-2xl">
					<div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8">
						{!hasEnded && (
							<div className="font-display text-cyan-300 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center tracking-wider">
								{countdown.label}
							</div>
						)}

						<div className="flex flex-col items-center justify-center gap-4">
							{!hasEnded ? (
								<>
									{countdown.days > 0 && (
										<div className="flex items-center justify-center gap-3">
											<CountdownItem num={countdown.days} isColon={false} />
											<span className="font-display text-cyan-300 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
												{countdown.days === 1 ? "day" : "days"}
											</span>
										</div>
									)}
									<div className="flex items-center justify-center">
										<CountdownItem num={countdown.hours} isColon={false} />
										<CountdownItem num=":" isColon={true} />
										<CountdownItem num={countdown.minutes} isColon={false} />
										<CountdownItem num=":" isColon={true} />
										<CountdownItem num={countdown.seconds} isColon={false} />
									</div>
								</>
							) : (
								<div className="font-display text-cyan-300 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center">
									Hacking has Ended!
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ShiftingCountdown;
