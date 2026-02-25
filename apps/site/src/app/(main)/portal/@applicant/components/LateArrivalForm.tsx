"use client";

import { useState } from "react";
import Button from "@/lib/components/Button/Button";
import ControlledDropdownSelect from "@/lib/components/forms/ControlledDropdownSelect";
import useArrivalTime from "@/lib/utils/useArrivalTime";

const ARRIVAL_TIMES = [
	{ value: "18:00", text: "6:00 PM" },
	{ value: "18:30", text: "6:30 PM" },
	{ value: "19:00", text: "7:00 PM" },
	{ value: "19:30", text: "7:30 PM" },
];

export default function LateArrivalForm() {
	const [arrivalTime, setArrivalTime] = useState<string>("18:00");
	const arrivalData = useArrivalTime();
	const currentArrivalTimeLabel = ARRIVAL_TIMES.find(
		(t) => t.value === arrivalData?.arrival_time,
	)?.text;

	const selectedLateTime = arrivalData?.arrival_time !== "17:00";

	return (
		<div className="mt-2 md:mt-8">
			{!selectedLateTime && (
				<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[0.9375rem] sm:text-2xl md:text-[2.5rem] md:leading-10 text-[var(--color-white)]">
					Update Your Arrival Time
				</h3>
			)}

			<p className="text-white text-lg mb-4">
				Current selected arrival time:{" "}
				<strong>
					{selectedLateTime ? currentArrivalTimeLabel : "5:00 PM"}
				</strong>
				<br />
				<br />
				Check-in starts Friday at 5 PM. Late check-in begins at 6 PM.
				{!selectedLateTime && (
					<>
						<br />
						<br />
						If you are arriving later than 5 PM, use the dropdown to change your
						arrival time. You won&apos;t be able to edit it after submitting.
						Arriving later than your selected time may result in your spot being
						given to another attendee.
					</>
				)}
			</p>

			{!selectedLateTime && (
				<form
					method="post"
					action="/api/user/rsvp/late-arrival"
					className="space-y-4"
				>
					<ControlledDropdownSelect
						name="arrival_time"
						labelText=""
						values={ARRIVAL_TIMES}
						containerClass="flex flex-col w-full max-w-md text-[var(--color-white)]"
						value={arrivalTime}
						onChange={setArrivalTime}
						required={true}
					/>

					<div className="mt-2 md:mt-8">
						<Button
							text="Save arrival time"
							isLightVersion={true}
							className="text-xs sm:text-base md:text-4xl !bg-pink"
						/>
					</div>
				</form>
			)}
		</div>
	);
}
