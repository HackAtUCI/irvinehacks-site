"use client";

import clsx from "clsx";
import styles from "./ScheduleScroll.module.scss";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ScheduleScroll({ weekdays }: { weekdays: string[] }) {
	const sheduleBarRef = useRef<HTMLDivElement>(null);
	const scheduleContainerRef = useRef<HTMLDivElement>(null);
	const scheduleBarWidth = useRef(0);

	const [newPos, setNewPos] = useState(0);

	const getScheduleWidth = () => {
		return sheduleBarRef.current
			? sheduleBarRef.current?.getBoundingClientRect().right -
					sheduleBarRef.current?.getBoundingClientRect().left
			: 0;
	};

	useEffect(() => {
		scheduleBarWidth.current = getScheduleWidth();
	}, []);

	const onMouseDown = () => {

		function mouseUpListener() {
			window.removeEventListener("mouseup", mouseUpListener);
			window.removeEventListener("mousemove", mouseMoveListener);
		}

		function mouseMoveListener(e: any) {
			setNewPos((pos) =>
				Math.min(
					Math.max(pos - e.movementX, -150),
					scheduleBarWidth.current - 500,
				),
			);
		}

		window.addEventListener("mouseup", mouseUpListener);
		window.addEventListener("mousemove", mouseMoveListener);
	};

	return (
		<div className="w-full flex flex-col items-center select-none">
			<h1>Schedule</h1>
			<div className="w-full flex gap-10 justify-center">
				<div>
					<ChevronLeft />
				</div>
				<div
					className={clsx(
						"w-[600px] h-[100px] gap-20 font-display text-6xl overflow-auto relative",
						styles.background,
						styles.hideScroll,
					)}
					onMouseDown={onMouseDown}
					ref={scheduleContainerRef}
				>
					<div
						className={clsx(
							"top-0 absolute h-full min-w-full w-fit flex gap-20",
						)}
						style={{ left: `${-newPos}px` }}
						ref={sheduleBarRef}
					>
						<div className="h-full w-[5%]" />
						{weekdays.map((weekday) => {
							return (
								<span className="whitespace-nowrap" key={weekday}>
									{weekday}
								</span>
							);
						})}
						<div className="h-full w-[5%]" />
					</div>
				</div>
				<div>
					<ChevronRight />
				</div>
			</div>
		</div>
	);
}
