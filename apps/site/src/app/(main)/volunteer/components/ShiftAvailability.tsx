import DayShift from "./DayShift";

export default function ShiftAvailability() {
	return (
		<div className="flex flex-col gap-10 items-start w-11/12">
			<div className="text-4xl font-bold">Shift Availability</div>
			<div className="w-full flex flex-col items-center gap-10">
				<DayShift
					shiftText="January 24 - Friday Shift"
					shiftLabel="friday_availability"
					startHour={7}
					endHour={24}
				/>
				<DayShift
					shiftText="January 25 - Saturday Shift"
					shiftLabel="saturday_availability"
					startHour={7}
					endHour={24}
				/>
				<DayShift
					shiftText="January 26 - Sunday Shift"
					shiftLabel="sunday_availability"
					startHour={7}
					endHour={18}
				/>
			</div>
		</div>
	);
}
