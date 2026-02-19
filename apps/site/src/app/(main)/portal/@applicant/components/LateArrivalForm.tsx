"use client";

import { useState } from "react";
import Button from "@/lib/components/Button/Button";
import ControlledDropdownSelect from "@/lib/components/forms/ControlledDropdownSelect";

const ARRIVAL_TIMES = [
	{ value: "18:00", text: "6:00 PM" },
	{ value: "18:30", text: "6:30 PM" },
	{ value: "19:00", text: "7:00 PM" },
	{ value: "19:30", text: "7:30 PM" },
];

export default function LateArrivalForm() {
	const [arrivalTime, setArrivalTime] = useState<string>("18:00");

	return (
		<div className="mt-2 md:mt-8">
			<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[0.9375rem] sm:text-2xl md:text-[2.5rem] md:leading-10 text-[var(--color-white)]">
				Update Your Arrival Time
			</h3>
			<form
				method="post"
				action="/api/user/rsvp/late-arrival"
				className="space-y-4"
			>
				<ControlledDropdownSelect
					name="arrival_time"
					labelText="Expected time of arrival (Friday). Failure to arrive at your specified check-in time may result in your spot being given to another attendee."
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
		</div>
	);
}
