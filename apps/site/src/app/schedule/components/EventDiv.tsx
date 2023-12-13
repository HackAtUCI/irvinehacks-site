import * as React from "react";

import { cn } from "@/lib/utils/utils";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface EventDivProps {
	titleText: string;
	subText: string;
	className?: string; // Optional className prop
}

const EventDiv = React.forwardRef<React.ElementRef<typeof Card>, EventDivProps>(
	({ titleText, subText, className, ...props }, ref) => {
		return (
			<Card
				ref={ref}
				className={cn(
					"w-2/3 flex flex-col m-5 border-2 text-center",
					className,
				)}
				{...props}
			>
				<CardHeader>
					<CardTitle className="mb-2 text-3xl">{titleText}</CardTitle>
					<CardDescription className="text-sm">
						{subText}
					</CardDescription>
				</CardHeader>
			</Card>
		);
	},
);
EventDiv.displayName = "EventDiv";

export default EventDiv;
