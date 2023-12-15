"use client";
import * as React from "react";

import { cn } from "@/lib/utils/utils";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
	titleText: string;
	badgeText: string;
	subText: string;
	meetingLink: string;
	time: string;
	description: string;
	footerText: string;
	className?: string; // Optional className prop
	badgeClassName?: string; // Optional className prop
}

const EventCard = React.forwardRef<
	React.ElementRef<typeof Card>,
	EventCardProps
>(
	(
		{
			className,
			badgeClassName,
			titleText,
			badgeText,
			subText,
			meetingLink,
			time,
			description,
			footerText,
			...props
		},
		ref,
	) => {
		const currentTime = new Date();

		return (
			<>
				<Card
					ref={ref}
					className={cn(
						"w-2/3 flex flex-col m-5 border-2",
						className,
						"hover:-translate-y-2 hover:scale-[102%] transition duration-150 ease-in-out",
					)}
					{...props}
				>
					<CardHeader className="relative">
						<CardTitle className="mb-2 text-3xl flex items-baseline text-[#FFDA7B]">
							{titleText} <span className="m-3 text-4xl">|</span>
							<p className="text-xl">{time}</p>
							<Badge
								variant="outline"
								className={cn(
									"ml-auto text-lg transition bg-[#DFBA73]",
									badgeClassName,
								)}
							>
								{badgeText}
							</Badge>
						</CardTitle>
						<Separator className="bg-white" />
						<CardDescription className="text-lg text-[#FFFCE2]">
							{subText}
						</CardDescription>
						<CardDescription className="text-md text-[#FFFCE2]">
							<a
								target="_blank"
								rel="noopener noreferrer"
								href={meetingLink}
								className="text-blue-600"
							>
								Meeting Link
							</a>
						</CardDescription>
					</CardHeader>
					<CardContent className="text-xl text-[#FFFCE2]">
						<p>{description}</p>
					</CardContent>
					<CardFooter className="ml-auto text-gray-300 text-white/50 ">
						<p>{footerText}</p>
					</CardFooter>
				</Card>
			</>
		);
	},
);
EventCard.displayName = "EventCard";

export default EventCard;
