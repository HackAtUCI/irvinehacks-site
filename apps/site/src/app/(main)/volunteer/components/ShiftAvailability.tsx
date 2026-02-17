import DayShift from "./DayShift";

export default function ShiftAvailability({ hidden }: { hidden?: boolean }) {
	return (
		<div
			className={hidden ? "hidden" : "flex flex-col gap-10 items-start w-11/12"}
		>
			<div className="text-4xl font-bold">Shift Availability</div>
			<div className="w-full flex flex-col items-center gap-10">
				<DayShift
					shiftText="February 27 - Friday Shift"
					shiftLabel="friday_availability"
					startHour={7}
					endHour={24}
				/>
				<DayShift
					shiftText="February 28 - Saturday Shift"
					shiftLabel="saturday_availability"
					startHour={7}
					endHour={24}
				/>
				<DayShift
					shiftText="March 1 - Sunday Shift"
					shiftLabel="sunday_availability"
					startHour={7}
					endHour={19}
				/>
			</div>
		</div>
	);
}
