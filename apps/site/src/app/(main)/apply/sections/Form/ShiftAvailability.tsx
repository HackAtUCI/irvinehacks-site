"use client";

import DayShift from "./DayShift";

export default function ShiftAvailability() {
	return (
		<div className="flex flex-col items-start w-11/12">
            Shift Availability
			<DayShift shiftText="January 24 - Friday Shift"/>
			<DayShift shiftText="January 25 - Saturday Shift"/>
			<DayShift shiftText="January 26 - Sunday Shift"/>
		</div>
	);
}
