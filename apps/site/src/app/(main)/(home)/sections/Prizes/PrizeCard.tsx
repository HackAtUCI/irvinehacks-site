import Image from "next/image";
import BackgroundImage from "@/assets/images/prize_card_background.svg";
import { PropsWithChildren } from "react";

interface PrizeCardProps {
	title: string;
}

export default function PrizeCard({
	title,
	children,
}: PrizeCardProps & PropsWithChildren) {
	return (
		<div className="relative flex items-center justify-center w-fit transition-transform duration-300 hover:scale-105">
			<Image src={BackgroundImage} alt="Background" height={350} priority />
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-4">
				<h3 className="font-display text-xl md:text-3xl [text-shadow:0_0_10px_#00ffff]">
					{title}
				</h3>
				{children}
			</div>
		</div>
	);
}
