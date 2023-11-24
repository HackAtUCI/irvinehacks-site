import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/lib/components/Button/Button";
import standBottom from "./stand-bottom.png";

interface StandProps {
	imageSrc: ComponentProps<typeof Image>["src"];
	header: string;
	description: string;
	buttonText: string;
	buttonHref: ComponentProps<typeof Link>["href"];
}

const Stand: React.FC<StandProps> = ({
	imageSrc,
	header,
	description,
	buttonText,
	buttonHref,
}) => {
	return (
		<div className="max-w-[450px] text-center flex flex-col items-stretch">
			<div className="relative aspect-[1/0.7] z-10">
				<h2 className="absolute mt-[4.5%] text-2xl z-20 w-full text-[#FFDA7B]">
					{header}
				</h2>
				<Image
					className="absolute left-0 top-0 w-full"
					src={imageSrc}
					alt=""
					aria-hidden
				/>
			</div>
			<div
				style={{
					backgroundImage: `url(${standBottom.src})`,
				}}
				className="relative ml-2 border-[6px] border-solid border-t-0 border-[#1B1006] overflow-hidden bg-top bg-repeat-y bg-[length:100%] flex-grow"
			>
				<p className="text-base pt-[16%] pb-4 px-12">{description}</p>
				<div className="mb-8">
					<Button text={buttonText} href={buttonHref} />
				</div>
			</div>
		</div>
	);
};

export default Stand;
