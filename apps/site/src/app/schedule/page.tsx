import { utcToZonedTime } from "date-fns-tz";

import ShiftingCountdown from "./components/ShiftingCountdown/ShiftingCountdown";

import EventCard from "./components/EventCard";
import EventDiv from "./components/EventDiv";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSchedule } from "./components/getSchedule";

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

const dateTimeFormat = new Intl.DateTimeFormat("en", {
	hour: "numeric",
	minute: "numeric",
});

const weekdayFormat = new Intl.DateTimeFormat("en", {
	weekday: "long",
});

export default async function Schedule() {
	const events = await getSchedule();

	console.log(events);

	return (
		<>
			<section className="h-full w-full mb-10">
				<div className="m-36">
					<ShiftingCountdown />
				</div>
				<Tabs defaultValue="Friday">
					<div className="flex flex-col items-center">
						<TabsList className="ml-auto rounded-2xl scale-125 mr-[20%]">
							<TabsTrigger
								value="Friday"
								className="rounded-l-2xl border"
							>
								Friday
							</TabsTrigger>
							<TabsTrigger
								value="Saturday"
								className="border-t border-b border-r"
							>
								Saturday
							</TabsTrigger>
							<TabsTrigger
								value="Sunday"
								className="rounded-r-2xl border"
							>
								Sunday
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="Friday">
						<div className="flex flex-col justify-center items-center mb-10">
							{events.map((day, i) => (
								<div
									key={i}
									className="flex flex-col justify-center items-center"
								>
									<EventDiv
										titleText={weekdayFormat.format(
											utcToZonedTime(
												day[0].startTime,
												"America/Los_Angeles",
											),
										)}
										subText=""
									></EventDiv>
									{day.map(
										({
											title,
											description,
											location,
											hosts,
											startTime,
											endTime,
										}) => {
											const startTimeZoned =
												utcToZonedTime(
													startTime,
													"America/Los_Angeles",
												);
											const endTimeZoned = utcToZonedTime(
												endTime,
												"America/Los_Angeles",
											);
											return (
												<EventCard
													key={title}
													titleText={title}
													badgeText="badgeText placeholder"
													subText={`Hosted by: ${hosts?.join(
														", ",
													)}`}
													meetingLink="placeholder"
													description="Short description of the event. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. "
													time={dateTimeFormat.formatRange(
														startTimeZoned,
														endTimeZoned,
													)}
													footerText="placeholder"
													className="bg-[#432810] bg-opacity-70 border-gray-400 border"
												></EventCard>
											);
										},
									)}
								</div>
							))}
							{/* <EventCard
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
							/> */}
						</div>
					</TabsContent>
				</Tabs>
			</section>
		</>
	);
}
