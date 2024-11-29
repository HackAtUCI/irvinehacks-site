import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";

import leftChatBox from "@/assets/images/left_chat_box.svg";
import centerChatBox from "@/assets/images/center_chat_box.svg";
import rightChatBox from "@/assets/images/right_chat_box.svg";
import leftChatBG from "@/assets/images/left_chat_box_bg.svg";
import centerChatBG from "@/assets/images/center_chat_box_bg.svg";
import rightChatBG from "@/assets/images/right_chat_box_bg.svg";

import styles from "./CharacterBox.module.scss";

export enum ChatBoxType {
	LEFT,
	CENTER,
	RIGHT,
}

interface CharacterBoxProps {
	className?: string;
	imageSrc: ComponentProps<typeof Image>["src"];
	chatText: string;
	titleText: string;
	clipClass: string;
	chatBoxType: ChatBoxType;
	href: string;
}

export default function CharacterBox({
	className,
	imageSrc,
	chatText,
	titleText,
	clipClass,
	chatBoxType,
	href,
}: CharacterBoxProps) {
	let chatBoxImageSrc;
	let bgImageSrc;
	let textAlign;

	switch (chatBoxType) {
		case ChatBoxType.LEFT:
			chatBoxImageSrc = leftChatBox;
			bgImageSrc = leftChatBG;
			textAlign = "text-left";
			break;

		case ChatBoxType.CENTER:
			chatBoxImageSrc = centerChatBox;
			bgImageSrc = centerChatBG;
			textAlign = "text-center";
			break;

		case ChatBoxType.RIGHT:
			chatBoxImageSrc = rightChatBox;
			bgImageSrc = rightChatBG;
			textAlign = "text-right";
			break;
	}

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
