/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/no-unused-vars */

import EventProps from "../EventProps";
import getTimeAndDates from "@/lib/utils/getTimeAndDates";

interface EventCardProps extends EventProps {
	isHappening: boolean;
}

export default function EventCard({
	title,
	location,
	virtual,
	startTime,
	endTime,
	organization,
	hosts,
	description,
	isHappening,
}: EventCardProps) {
	return (
		<div
			className={`w-[90%] min-w-[200px] h-full bg-[#170f51]/50 border-[9px] border-yellow relative p-6 lg:p-12 font-display max-lg:w-full ${"max-lg:bg-blue-100 max-lg:border-blue-900 max-lg:text-blue-950 max-lg:top-[-8px]"}`}
		>
			{title ? (
				<>
					<div>
						<div className="flex justify-between gap-5 max-lg:flex-col">
							<div className="h-fit w-full flex justify-between items-center">
								<h1 className="text-2xl lg:text-4xl [text-shadow:0_0_25px] max-w-[80%]">
									{title}
								</h1>
							</div>
						</div>
						<div className="pt-6 text-yellow">
							<div className="w-full flex justify-between gap-5 max-lg:flex-col ">
								<p className="text-lg lg:text-2xl mb-0">
									<span>Location: </span>
									{virtual ? <a>Zoom</a> : location}
								</p>
							</div>
							<p className="text-lg lg:text-2xl mt-0 mb-0">{`Time: ${
								startTime.getTime() === endTime.getTime()
									? `${getTimeAndDates(endTime).compositeTimeHourMinute} ${
											getTimeAndDates(endTime).amPm
									  }`
									: `${getTimeAndDates(startTime).compositeTimeHourMinute} - ${
											getTimeAndDates(endTime).compositeTimeHourMinute
									  } ${getTimeAndDates(endTime).amPm}`
							}`}</p>

							{organization && (
								<p className="text-lg lg:text-2xl mt-0 mb-0">By: {organization}</p>
							)}
						</div>
					</div>
					<div>
						{hosts && (
							<div className="text-lg lg:text-2xl">{`Hosted By: ${hosts?.join(
								", ",
							)}`}</div>
						)}
						<div className="text-md lg:text-2xl text-[#FFFFFF] font-sans leading-[150%] font-normal pt-5">
							{description}
						</div>
					</div>
				</>
			) : (
				<div className="text-4xl w-full h-full flex justify-center border-yellow items-center">
					No Event Selected...
				</div>
			)}
		</div>
	);
}
