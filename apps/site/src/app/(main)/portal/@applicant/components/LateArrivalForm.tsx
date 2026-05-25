"use client";

import { useState } from "react";
import Button from "@/lib/components/Button/Button";
import useArrivalTime from "@/lib/utils/useArrivalTime";

const LATE_ARRIVAL_MIN = "18:00";
const LATE_ARRIVAL_MAX = "19:30";
const DEFAULT_CHECKIN_TIME = "17:00";

function formatTimeLabel(value: string): string {
	const [hours, minutes] = value.split(":");
	const date = new Date();
	date.setHours(Number(hours), Number(minutes));
	return date.toLocaleString("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});
}

export default function LateArrivalForm() {
	const [arrivalTime, setArrivalTime] = useState<string>(LATE_ARRIVAL_MIN);
	const [isEditing, setIsEditing] = useState(false);
	const arrivalData = useArrivalTime();

	const selectedLateTime =
		arrivalData?.arrival_time !== undefined &&
		arrivalData?.arrival_time !== null &&
		arrivalData.arrival_time !== DEFAULT_CHECKIN_TIME;

	const pendingRequest = arrivalData?.late_arrival_edit_request ?? null;

	const currentArrivalTimeLabel = arrivalData?.arrival_time
		? formatTimeLabel(arrivalData.arrival_time)
		: "5:00 PM";

	return (
		<div className="mt-2 md:mt-8">
			{!selectedLateTime && (
				<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[0.9375rem] sm:text-2xl md:text-[2.5rem] md:leading-10 text-[var(--color-white)]">
					Update Your Arrival Time
				</h3>
			)}

			<p className="text-white text-lg mb-4">
				Current selected arrival time:{" "}
				<strong>{currentArrivalTimeLabel}</strong>
				<br />
				<br />
				Check-in starts Friday at 5 PM. Late check-in begins at 6 PM.
				{!selectedLateTime && (
					<>
						<br />
						<br />
						If you are arriving later than 5 PM, use the time picker to choose
						your arrival time (between 6:00 PM and 7:30 PM). Arriving later than
						your selected time may result in your spot being given to another
						attendee.
					</>
				)}
			</p>

			{pendingRequest && !isEditing && (
				<p className="text-yellow-300 text-lg mb-4">
					Pending approval: <strong>{formatTimeLabel(pendingRequest)}</strong>
					<br />
					Your edit request is awaiting approval from a check-in lead.
				</p>
			)}

			{!selectedLateTime && (
				<form
					method="post"
					action="/api/user/rsvp/late-arrival"
					className="space-y-4"
				>
					<div className="flex flex-col w-full text-[var(--color-white)]">
						<label className="text-lg mb-2" htmlFor="arrival_time">
							Arrival time
						</label>
						<input
							id="arrival_time"
							name="arrival_time"
							type="time"
							min={LATE_ARRIVAL_MIN}
							max={LATE_ARRIVAL_MAX}
							value={arrivalTime}
							onChange={(e) => setArrivalTime(e.target.value)}
							required
							className="bg-[#e1e1e1] text-[var(--color-black)] text-lg h-10 p-1.5 rounded-md"
						/>
					</div>

					<div className="mt-2 md:mt-8">
						<Button
							text="Save arrival time"
							isLightVersion={true}
							className="text-xs sm:text-base md:text-4xl !bg-pink"
						/>
					</div>
				</form>
			)}

			{selectedLateTime && !isEditing && (
				<button
					type="button"
					onClick={() => setIsEditing(true)}
					className="text-white underline text-lg"
				>
					Request edit
				</button>
			)}

			{selectedLateTime && isEditing && (
				<form
					method="post"
					action="/api/user/rsvp/late-arrival"
					className="space-y-4"
				>
					<div className="flex flex-col w-full max-w-md text-[var(--color-white)]">
						<label className="text-lg mb-2" htmlFor="arrival_time_edit">
							New arrival time
						</label>
						<input
							id="arrival_time_edit"
							name="arrival_time"
							type="time"
							min={LATE_ARRIVAL_MIN}
							max={LATE_ARRIVAL_MAX}
							value={arrivalTime}
							onChange={(e) => setArrivalTime(e.target.value)}
							required
							className="bg-[#e1e1e1] text-[var(--color-black)] text-lg h-10 p-1.5 rounded-md"
						/>
					</div>

					<div className="mt-4 flex gap-4 items-center">
						<Button
							text="Submit request"
							isLightVersion={true}
							className="!text-base !bg-pink"
						/>
						<button
							type="button"
							onClick={() => setIsEditing(false)}
							className="text-white underline text-base"
						>
							Cancel
						</button>
					</div>
				</form>
			)}
		</div>
	);
}
