import type { ComponentProps } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import centerChatBox from "@/assets/images/center_chat_box.svg";
import centerChatBG from "@/assets/images/center_chat_box_bg.svg";

import styles from "./CharacterBox.module.scss";

interface CharacterBoxProps {
	className?: string;
	imageSrc: ComponentProps<typeof Image>["src"];
	chatText: string;
	titleText: string;
	clipClass: string;
	chatBoxImageSrc: StaticImageData;
	bgImageSrc: StaticImageData;
	textAlign: string;
	href: string;
}

export default function CharacterBox({
	className,
	imageSrc,
	chatText,
	titleText,
	clipClass,
	chatBoxImageSrc,
	bgImageSrc,
	textAlign,
	href,
}: CharacterBoxProps) {
	return (
		<div
			className={`${className} ${styles.hoverGroup} flex flex-col items-center justify-center mb-20 lg:mb-0`}
		>
			<div className="relative">
				<Image className="absolute hidden lg:block" src={bgImageSrc} alt="" />
				<Image className="absolute lg:hidden" src={centerChatBG} alt="" />
				<div className={styles.chatBox + " relative"}>
					<Link href={href}>
						<p
							className={`absolute h-full w-full z-10 ${textAlign} text-[1.375rem] text-wrap mb-0 mt-4 p-6 pointer-events-none`}
						>
							{chatText}
						</p>
						<Image className="hidden lg:block" src={chatBoxImageSrc} alt="" />
						<Image className="lg:hidden" src={centerChatBox} alt="" />
					</Link>
				</div>
			</div>

			<Link className="relative w-5/6" href={href}>
				<div className={`${clipClass} absolute w-full h-full z-10`} />
				<Image className={`${styles.sprite} relative`} src={imageSrc} alt="" />
			</Link>

			<Link href={href}>
				<h3 className={`${styles.spriteTitle} font-display text-4xl relative`}>
					{titleText}
				</h3>
			</Link>
		</div>
	);
}
