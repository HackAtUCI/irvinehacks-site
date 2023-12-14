import ShiftingCountdown from "./components/ShiftingCountdown/ShiftingCountdown";

import EventCard from "./components/EventCard";
import EventDiv from "./components/EventDiv";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const revalidate = 60;

const defaultCardProps = {
	titleText: "Event Name",
	badgeText: "Badge",
	subText: "Hosted by: <Insert Organization Name>",
	time: "X:XX PM - X:XX PM PST",
	meetingLink: "https://www.google.com/",
	description:
		"Short description of the event. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
	footerText: "Starting in X minutes",
	badgeClassName: "bg-slate-600",
};

export default function Schedule() {
	return (
		<>
			<section className="h-full w-full mb-10">
				<div className="m-36">
					<ShiftingCountdown />
				</div>
				<Tabs defaultValue="Friday">
					<div className="flex flex-col items-center">
						<TabsList className="flex justify-end w-2/3 items-center rounded-2xl scale-125">
							<TabsTrigger
								value="Friday"
								className="border data-[state=active]:bg-slate-400 data-[state=active]:bg-opacity-60 rounded-l-2xl"
							>
								Friday
							</TabsTrigger>
							<TabsTrigger
								className="border data-[state=active]:bg-slate-400 data-[state=active]:bg-opacity-60"
								value="Saturday"
							>
								Saturday
							</TabsTrigger>
							<TabsTrigger
								value="Sunday"
								className="border data-[state=active]:bg-slate-400 data-[state=active]:bg-opacity-60 rounded-r-2xl"
							>
								Sunday
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="Friday">
						<div className="flex flex-col justify-center items-center mb-10">
							<EventCard
								{...defaultCardProps}
								className="bg-zinc-700 bg-opacity-70 border-gray-400 border"
							/>
							<EventDiv
								className="bg-green-600"
								titleText="Hacking Starts"
								subText="X:XX PM - X:XX PM PST"
							/>
							<EventCard
								{...defaultCardProps}
								className="bg-gray-500 bg-opacity-60 border-gray-400 border"
							/>
							<EventCard
								{...defaultCardProps}
								className="bg-gray-500 bg-opacity-60 border-gray-400 border"
							/>
							<EventCard
								{...defaultCardProps}
								className="bg-gray-500 bg-opacity-60 border-gray-400 border"
							/>
							<EventCard {...defaultCardProps} className="" />
							<EventDiv
								className="bg-red-700"
								titleText="Hacking Ends"
								subText="X:XX PM - X:XX PM PST"
							/>
						</div>
					</TabsContent>
				</Tabs>
			</section>
		</>
	);
}
