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

const EventCard = React.forwardRef<
	React.ElementRef<typeof Card>,
	React.ComponentPropsWithoutRef<typeof Card>
>(({ className, ...props }, ref) => {
	return (
		<Card
			ref={ref}
			className={cn("w-2/3 flex flex-col m-5 border-2", className)}
			{...props}
		>
			<CardHeader>
				<CardTitle className="mb-2 text-3xl flex">
					Event Name
					<Badge
						variant="outline"
						className="ml-auto text-lg transition bg-gradient-to-tr from-red-500 via-blue-400 to-purple-500"
					>
						Badge
					</Badge>
				</CardTitle>
				<Separator className="bg-white" />
				<CardDescription className="text-lg">
					Hosted By: XXX Organization
				</CardDescription>
				<CardDescription className="text-sm">
					X:XX PM - X:XX PM PST | <a>Meeting Link</a>
				</CardDescription>
			</CardHeader>
			<CardContent className="text-xl">
				<p>
					Short description of the event. Lorem ipsum dolor sit amet,
					consectetur adipiscing elit, sed do eiusmod tempor
					incididunt ut labore et dolore magna aliqua. Ut enim ad
					minim veniam, quis nostrud exercitation ullamco laboris nisi
					ut aliquip ex ea commodo consequat.{" "}
				</p>
			</CardContent>
			<CardFooter className="ml-auto text-gray-300">
				<p>Starting in XXX minutes</p>
			</CardFooter>
		</Card>
	);
});
EventCard.displayName = "EventCard";

export default EventCard;
