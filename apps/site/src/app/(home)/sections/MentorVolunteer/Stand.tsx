import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";

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
		<div className="relative max-w-[512px] aspect-[1/1.117] grid grid-rows-[15%_45%_25%_15%] items-center text-center">
			<h2 className="row-start-1 text-2xl">{header}</h2>
			<p className="row-start-3 text-base py-12 px-16">{description}</p>
			<Link className="row-start-4" href={buttonHref}>
				{buttonText}
			</Link>
			<Image
				className="absolute left-0 top-0 w-full -z-10"
				src={imageSrc}
				alt=""
				aria-hidden
			/>
		</div>
	);
};

export default Stand;
