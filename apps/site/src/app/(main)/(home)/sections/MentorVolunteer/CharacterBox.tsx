import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";

import leftChatBox from "./left_chat_box.svg";
import centerChatBox from "./chat_center_box.svg";
import rightChatBox from "./right_chat_box.svg";
import leftChatBG from "./left_chat_box_bg.svg";
import centerChatBG from "./chat_center_box_bg.svg";
import rightChatBG from "./right_chat_box_bg.svg";

import styles from "./CharacterBox.module.scss";

export enum ChatBoxType {
	LEFT,
	CENTER,
	RIGHT,
}

interface CharacterBoxProps {
	imageSrc: ComponentProps<typeof Image>["src"];
	chatText: string;
	titleText: string;
	chatBoxType: ChatBoxType;
}

export default function CharacterBox({
	imageSrc,
	chatText,
	titleText,
	chatBoxType,
}: CharacterBoxProps) {
	const chatBoxImageSrc =
		chatBoxType === ChatBoxType.LEFT
			? leftChatBox
			: chatBoxType === ChatBoxType.CENTER
			  ? centerChatBox
			  : rightChatBox;

	const bgImageSrc =
		chatBoxType === ChatBoxType.LEFT
			? leftChatBG
			: chatBoxType === ChatBoxType.CENTER
			  ? centerChatBG
			  : rightChatBG;

	const textAlign =
		chatBoxType === ChatBoxType.LEFT
			? "text-left"
			: chatBoxType === ChatBoxType.CENTER
			  ? "text-center"
			  : "text-right";
	return (
		<div className="flex flex-col items-center justify-center">
			<div className="relative">
				<Image className="absolute" src={bgImageSrc} alt="" />
				<div className={styles.chatBox + " relative"}>
					<p
						className={`absolute h-full w-full z-10 ${textAlign} text-[1.375rem] text-wrap mb-0 mt-4 p-6 pointer-events-none`}
					>
						{chatText}
					</p>
					<Image className="" src={chatBoxImageSrc} alt="" />
				</div>
			</div>

			<Image src={imageSrc} alt="" />
			<h2 className="font-display text-4xl">{titleText}</h2>
		</div>
	);
}
