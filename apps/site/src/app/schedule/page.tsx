import ShiftingCountdown from "./components/ShiftingCountdown/ShiftingCountdown";
import EventCard from "./components/EventCard";
import EventDiv from "./components/EventDiv";
export const revalidate = 60;

export default function Schedule() {
	return (
		<>
			<section className="h-full w-full">
				<div className="m-36">
					<ShiftingCountdown />
				</div>
				<div className="flex flex-col justify-center items-center mb-10">
					<EventCard className="hover:-translate-y-2 hover:scale-[102%] transition duration-150 ease-in-out bg-slate-500" />
					<EventDiv
						className="bg-green-600"
						titleText="Hacking Starts"
						subText="X:XX PM - X:XX PM PST"
					/>
					<EventCard className="hover:-translate-y-2 hover:scale-[102%] transition duration-150 ease-in-out bg-red-400" />
					<EventCard className="hover:-translate-y-2 hover:scale-[102%] transition duration-150 ease-in-out bg-green-500" />
					<EventCard className="hover:-translate-y-2 hover:scale-[102%] transition duration-150 ease-in-out bg-orange-900" />
					<EventCard className="hover:-translate-y-2 hover:scale-[102%] transition duration-150 ease-in-out" />
					<EventDiv
						className="bg-red-700"
						titleText="Hacking Ends"
						subText="X:XX PM - X:XX PM PST"
					/>
				</div>
			</section>
		</>
	);
}
