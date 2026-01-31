import React from "react";
import { Header } from "@cloudscape-design/components";

function as12Hour(hour: number) {
	const suffix = hour >= 12 ? "PM" : "AM";

	hour = hour % 12;
	hour = hour || 12; // instead of 0
	return hour + suffix;
}

interface DayShiftProps {
	shiftText: string;
	startHour: number;
	endHour: number;
	hoursArray: number[] | ReadonlyArray<number>;
}

export default function DayShift({
	shiftText,
	startHour,
	endHour,
	hoursArray,
}: DayShiftProps) {
	const num_hours = endHour - startHour;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				width: "100%",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					position: "relative",
					width: "100%",
				}}
			>
				<Header variant="h3">{shiftText}</Header>
				{Array.from({ length: num_hours }).map((_, i) => {
					const hour = startHour + i;
					const available = hoursArray.includes(hour);
					return (
						<div
							key={`shift_${i}`}
							style={{
								position: "relative",
								width: "100%",
								display: "flex",
								justifyContent: "space-between",
							}}
						>
							<div>{as12Hour(hour)}</div>
							<div
								style={{
									height: "50px",
									width: "85%",
									backgroundColor: available ? "#4ade80" : "#e5e7eb",
									border: "2px solid black",
									borderBottom:
										i === num_hours - 1 ? "2px solid black" : "none",
								}}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
