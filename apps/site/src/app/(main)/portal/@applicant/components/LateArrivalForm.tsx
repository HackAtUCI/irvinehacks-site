"use client";

import { useState } from "react";
import { Status } from "@/lib/userRecord";
import useUserIdentity from "@/lib/utils/useUserIdentity";
import Button from "@/lib/components/Button/Button";
import useArrivalTime from "@/lib/utils/useArrivalTime";

interface LateArrivalFormProps {
	status?: Status;
}

function formatTimeLabel(time: string): string {
	const [hourStr, minuteStr] = time.split(":");
	const hour = parseInt(hourStr, 10);
	const minute = minuteStr ?? "00";
	if (Number.isNaN(hour)) return time;
	const period = hour >= 12 ? "PM" : "AM";
	const displayHour = hour % 12 === 0 ? 12 : hour % 12;
	return `${displayHour}:${minute} ${period}`;
}

export default function LateArrivalForm({ status }: LateArrivalFormProps) {
	const identity = useUserIdentity();
	const isWaitlisted =
		status === Status.Waitlisted || identity?.decision === Status.Waitlisted;

	const minLateTime = isWaitlisted ? "19:00" : "18:00";
	const maxLateTime = isWaitlisted ? "20:30" : "19:30";
	const allowedLateTimes = isWaitlisted
		? ["19:00", "19:30", "20:00", "20:30"]
		: ["18:00", "18:30", "19:00", "19:30"];
	const onTimeArrival = isWaitlisted ? "18:00" : "17:00";
	const onTimeArrivalLabel = isWaitlisted ? "6:00 PM" : "5:00 PM";
	const checkInLabel = isWaitlisted ? "6 PM" : "5 PM";
	const lateCheckInLabel = isWaitlisted ? "7 PM" : "6 PM";

	const arrivalData = useArrivalTime();

	const selectedLateTime =
		arrivalData?.arrival_time !== null &&
		arrivalData?.arrival_time !== undefined &&
		arrivalData.arrival_time !== onTimeArrival;
	const isApproved = arrivalData?.approved === true;
	const currentArrivalTimeLabel = arrivalData?.arrival_time
		? formatTimeLabel(arrivalData.arrival_time)
		: onTimeArrivalLabel;

	const [arrivalTime, setArrivalTime] = useState<string>(minLateTime);

	return (
		<div className="mt-2 md:mt-8">
			{!selectedLateTime && (
				<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[0.9375rem] sm:text-2xl md:text-[2.5rem] md:leading-10 text-[var(--color-white)]">
					Update Your Arrival Time
				</h3>
			)}

			{selectedLateTime && (
				<div
					className={`mb-4 p-4 rounded-lg border-2 ${
						isApproved
							? "bg-green-900/30 border-green-400 text-green-200"
							: "bg-yellow-900/30 border-yellow-400 text-yellow-200"
					}`}
				>
					<p className="text-base md:text-lg">
						<strong>
							{isApproved
								? `✓ Late arrival approved — see you at ${currentArrivalTimeLabel}!`
								: "⏳ Late arrival submitted — pending confirmation."}
						</strong>
					</p>
				</div>
			)}

			<p className="text-white text-lg mb-4">
				Current selected arrival time:{" "}
				<strong>{currentArrivalTimeLabel}</strong>
				<br />
				<br />
				Check-in starts Friday at {checkInLabel}. Late check-in begins at{" "}
				{lateCheckInLabel}.
				{!selectedLateTime && (
					<>
						<br />
						<br />
						If you are arriving later than {checkInLabel}, use the time picker
						below to choose your expected arrival time. You won&apos;t be able
						to edit it after submitting. Arriving later than your selected time
						may result in your spot being given to another attendee.
					</>
				)}
			</p>

			{!selectedLateTime && (
				<form
					method="post"
					action="/api/user/rsvp/late-arrival"
					className="space-y-4"
					onSubmit={(e) => {
						if (!allowedLateTimes.includes(arrivalTime)) {
							e.preventDefault();
							alert(
								`Please choose one of: ${allowedLateTimes
									.map(formatTimeLabel)
									.join(", ")}.`,
							);
						}
					}}
				>
					<div className="flex flex-col w-full max-w-md text-[var(--color-white)]">
						<label className="text-lg mb-2" htmlFor="arrival_time">
							Expected arrival time:
						</label>
						<input
							type="time"
							id="arrival_time"
							name="arrival_time"
							value={arrivalTime}
							min={minLateTime}
							max={maxLateTime}
							step={1800}
							onChange={(e) => setArrivalTime(e.target.value)}
							required
							className="bg-[#e1e1e1] text-[var(--color-black)] text-lg h-10 p-1.5 rounded-md"
						/>
						<p className="text-sm mt-2 opacity-80">
							Available times:{" "}
							{allowedLateTimes.map(formatTimeLabel).join(", ")}
						</p>
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
		</div>
	);
}
