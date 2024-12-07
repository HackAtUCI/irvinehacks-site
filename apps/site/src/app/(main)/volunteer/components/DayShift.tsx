"use client";

import React from "react";
import { useState } from "react";

interface ShiftInputs {
	shiftText: string;
	startHour: number;
	endHour: number;
	shiftLabel: string;
}

export default function DayShift({
	shiftText,
	startHour,
	endHour,
	shiftLabel,
}: ShiftInputs) {
	const num_hours = endHour - startHour;

	const [avaBefore, setAvaBefore] = useState(Array(num_hours).fill(false));
	const [available, setAvailable] = useState(Array(num_hours).fill(false));
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

	return (
		<div className="flex flex-col items-start w-11/12">
			<div className="flex flex-col relative w-full">
				<input
					className="hidden"
					readOnly
					value={`{${available.reduce(
						(acc, cur, ind) =>
							(acc = `"${ToAMPM(startHour + ind)}" : ${cur.toString()}${
								ind > 0 ? ", " : ""
							}${acc}`),
						"",
					)}}`}
					name={shiftLabel}
				/>
				<div className="w-full text-2xl text-center pb-5">{shiftText}</div>
				{available.map((_, i) => {
					return (
						<div
							key={`shift_${i}`}
							className="relative w-full flex justify-end"
						>
							<div className=" top-[-7px] text-xs left-0 pr-2 mt-[-7px] min-w-[45px]">
								{ToAMPM(i + startHour)}
							</div>
							<div
								className={`h-[30px] w-full ${
									i === endHour - startHour ? "" : "border-black border-b-2"
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
