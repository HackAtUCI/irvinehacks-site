import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";

import styles from "./ChooseCharacter.module.scss";

interface CharacterBoxProps {
	className?: string;
	imageSrc: ComponentProps<typeof Image>["src"];
	chatText: string;
	titleText: string;
	clipClass: string;
	textAlign: string;
	href: string;
}

export default function CharacterBox({
	className,
	imageSrc,
	chatText,
	titleText,
	clipClass,
	textAlign,
	href,
}: CharacterBoxProps) {
	return (
		<div
			className={`${className} ${styles.hoverGroup} flex flex-col items-center justify-center mb-20 lg:mb-0`}
		>
			<Link
				className="relative w-5/6 h-[300px] flex justify-center items-center"
				href={href}
			>
				<div className={`${clipClass} absolute w-full h-full z-10`} />
				<Image
					className={`${styles.sprite} relative object-contain`}
					src={imageSrc}
					alt="app sprite"
					width={500}
					height={500}
				/>
			</Link>

			<div className="flex justify-center items-center mx-auto w-5/6 bg-[#0FF] text-black p-2 py-4 border rounded-md border-[#0FF] mb-10">
				<Link href={href}>
					<h3
						className={`${styles.spriteTitle} font-display text-2xl xs:text-1xl md:text-3xl lg:text-3xl relative`}
					>
						{titleText}
					</h3>
				</Link>
			</div>

			<div className="bg-[#00FFFF4F] lg:h-[175px] flex justify-center items-center w-5/6 min-h-[120px]">
				<Link href={href}>
					<p
						className={`text-center text-[1rem] text-wrap mb-0 mt-4 p-6 pointer-events-none`}
					>
						{chatText}
					</p>
				</Link>
			</div>
		</div>
	);
}