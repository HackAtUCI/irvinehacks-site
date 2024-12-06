"use client";

import React from "react";
import { useState, useRef } from "react";

const NUM_HOURS = 12;
const HOURS_START = 7;

export default function DayShift({ shiftText }) {
	const [avaBefore, setAvaBefore] = useState(Array(NUM_HOURS).fill(false));
	const [available, setAvailable] = useState(Array(NUM_HOURS).fill(false));
	const [isMouseDown, setIsMouseDown] = useState(false);
	const [firstClicked, setFirstClicked] = useState(false);

	function ToAMPM(hours: number) {
		const ampm = hours >= 12 ? "PM" : "AM";

		hours = hours % 12;
		hours = hours ? hours : 12;
		return hours + ampm;
	}

	function onMouseDown(
		e: React.MouseEvent<HTMLDivElement, MouseEvent>,
		i: number,
	) {
		e.preventDefault();
		setIsMouseDown(true);
		setFirstClicked(available[i]);
		setAvaBefore(available);
		setAvailable((available) => [
			...available.slice(0, i),
			!available[i],
			...available.slice(i + 1),
		]);
	}

	function onMouseOver(i: number) {
		if (isMouseDown) {
			setAvailable((available) => [
				...available.slice(0, i),
				!firstClicked,
				...available.slice(i + 1),
			]);
		}
	}

	function onMouseUp() {
		setIsMouseDown(false);
		setAvaBefore(available);
	}

	const times = Array(12).fill(false);

	return (
		<div className="flex flex-col items-start w-11/12">
			<div className="flex flex-col relative w-full">
				<div className="w-full text-xl text-center">{shiftText}</div>
				{times.map((_, i) => {
					return (
						<div
							key={`shift_${i}`}
							className="relative w-full flex justify-end"
						>
							<div className=" top-[-7px] text-xs left-0 pr-2 mt-[-7px] min-w-[45px]">
								{ToAMPM(i + HOURS_START)}
							</div>
							<div
								className={`h-[30px] w-full ${
									i === NUM_HOURS ? "" : "border-black border-b-2"
								} ${available[i] ? "bg-blue-500" : "bg-gray-200"}`}
								onMouseDown={(e) => onMouseDown(e, i)}
								onMouseUp={onMouseUp}
								onMouseOver={() => onMouseOver(i)}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
