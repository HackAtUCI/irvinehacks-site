import { SwordsIcon } from "lucide-react";
import { motion } from "framer-motion";

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
			className={`w-[90%] min-w-[200px] h-full bg-black border-4 border-white relative p-16 font-display max-lg:w-full ${
				isHappening &&
				"max-lg:bg-blue-100 max-lg:border-blue-900 max-lg:text-blue-950 max-lg:top-[-8px] max-lg:left-[-8px]"
			}`}
		>
			{title ? (
				<>
					<div>
						<div className="flex justify-between gap-5 max-lg:flex-col">
							<div className="h-fit w-full flex justify-between items-center">
								<h1 className="text-4xl max-w-[80%] max-sm:text-3xl">
									{title}
								</h1>
								{isHappening && (
									<motion.div
										className="min-w-[50px] max-[400px]:hidden"
										animate={{ y: ["0%", "-10%", "0%"] }}
										transition={{
											repeat: Infinity,
											duration: 2,
											ease: "easeInOut",
										}}
									>
										<SwordsIcon width={50} height={50} color="rgb(23 37 84)" />
									</motion.div>
								)}
							</div>
							<p className="text-2xl">{getTimeAndDates(startTime).day}</p>
						</div>
						<div className="pt-5">
							<div className="w-full flex justify-between gap-5 max-lg:flex-col ">
								<p className="text-2xl">
									<span>Location: </span>
									{virtual ? <a>Zoom</a> : location}
								</p>
								{organization && <p className="text-xl">By: {organization}</p>}
							</div>
							<p className="text-xl">{`Time: ${
								getTimeAndDates(startTime).compositeTimeHourMinute
							} - ${getTimeAndDates(endTime).compositeTimeHourMinute} ${
								getTimeAndDates(endTime).amPm
							}`}</p>
						</div>
					</div>
					<div
						className={`w-full h-[2px] ${
							isHappening ? "bg-blue-900" : "bg-white"
						} mt-4 mb-4`}
					/>
					<div>
						{hosts && (
							<div className="text-2xl">{`Hosted By: ${hosts?.join(
								", ",
							)}`}</div>
						)}
						<div className="text-xl pt-5">{description}</div>
					</div>
				</>
			) : (
				<div className="text-4xl w-full h-full flex justify-center items-center">
					No Event Selected...
				</div>
			)}
		</div>
	);
}
