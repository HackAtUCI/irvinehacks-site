import Image from "next/image";

import ApplicationHeaderImage from "@/assets/icons/application-needed-warning-sign.png";

export default function ApplicationHeader() {
	return (
		<div className="flex flex-col items-center justify-center gap-y-5 mb-20">
			<Image
				src={ApplicationHeaderImage}
				alt="application header"
				className="w-[100px] md:w-[125px] lg:w-[150px]"
			/>
			<h2 className="font-display text-center text-[#FF4DEF] text-3xl md:text-4xl lg:text-5xl">
				Attention
			</h2>
		</div>
	);
}
