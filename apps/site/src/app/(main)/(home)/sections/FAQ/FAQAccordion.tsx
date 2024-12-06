"use client";

import React, { useState } from "react";
import Image from "next/image";

import SpeechMobile from "./speech-mobile.svg";
import SpeechDesktop from "./speech-desktop.svg";

import ListItemButton from "./ListItemButton";
import TriangleIcon from "./TriangleIcon";

import styles from "./FAQ.module.scss";

interface FAQAccordion {
	faq: {
		_key: string;
		question: JSX.Element;
		answer: JSX.Element;
	}[];
}

const FAQAccordion: React.FC<FAQAccordion> = ({ faq }) => {
	const faqGroup1 = faq.slice(0, 8);
	const faqGroup2 = faq.slice(8);

	const [page1Selected, setPage1Selected] = useState<boolean>(true);

	const [focusedQuestion, setFocusedQuestion] = useState<null | {
		_key: string;
		question: JSX.Element;
		answer: JSX.Element;
	}>(null);

	return (
		<div className="flex flex-1 justify-center sm:h-auto mt-16 sm:mt-8 mb-[-250px] sm:mb-0">
			{/* Changes size of parent component */}
			<div
				className={`z-0 ${
					focusedQuestion ? "h-[520px]" : "h-[965px]"
				} duration-200 transition-transform sm:hidden`}
			/>
			<div className="relative flex justify-center sm:hidden">
				<Image
					src={SpeechMobile}
					alt="Dialuge box background"
					className={`${styles.backgroundImage} ${
						focusedQuestion ? "mt-[-160px]" : "mt-[-275px]"
					}`}
					layout="responsive"
				/>

				{/* No question is focused. */}
				<div
					className={`${
						focusedQuestion
							? "opacity-0 pointer-events-none"
							: "opacity-100 z-50"
					} duration-200 w-[320px] absolute mx-4 mt-2 h-fit`}
				>
					<div>
						{faq.map((F) => (
							<ListItemButton
								key={F._key}
								onClick={() => setFocusedQuestion(F)}
								text={F.question}
								inverted={false}
								displace={4}
							/>
						))}
					</div>
				</div>

				{/* Question is focused. */}
				<div
					className={`${
						focusedQuestion
							? "opacity-100 z-50"
							: "opacity-0 pointer-events-none"
					} duration-200 absolute w-[320px] h-[350px] mt-2`}
				>
					<ListItemButton
						onClick={() => setFocusedQuestion(null)}
						className="mb-3"
						text={focusedQuestion?.question}
						rotate="rotate-90"
						displace={4}
						inverted
					/>

					<p>{focusedQuestion?.answer}</p>

					<div className="-bottom-2 absolute">
						<ListItemButton
							onClick={() => setFocusedQuestion(null)}
							text="Ask another question"
							rotate="rotate-180"
							displace={4}
							inverted={false}
						/>
					</div>
				</div>
			</div>

			<Image
				src={SpeechDesktop}
				alt="Dialuge box background"
				className="hidden sm:block h-fit sm:max-w-[425px] sm:h-[205px] md:max-w-[520px] md:h-[245px] lg:max-w-[630px] lg:h-[292px] xl:max-w-[775px] xl:h-[350px] duration-300"
			/>
			<div className="hidden sm:block absolute sm:w-[380px] md:w-[460px] lg:w-[555px] xl:w-[685px] text-[.6rem] md:text-[.75rem] lg:text-[.85rem] xl:text-[1rem] mt-3">
				{/* Page 1 focused */}
				<div
					className={`absolute w-full duration-300 ${
						page1Selected && !focusedQuestion
							? "opacity-100 z-50"
							: "opacity-0 pointer-events-none"
					}`}
				>
					{faqGroup1.map((F) => (
						<ListItemButton
							key={F._key}
							onClick={() => setFocusedQuestion(F)}
							text={F.question}
							inverted={false}
							displace={3}
							className="mb-0 py-[2px]"
						/>
					))}
					<div className="flex justify-end w-full ms-3">
						<button
							type="button"
							onClick={() => {
								setPage1Selected(false);
							}}
							className={`flex items-center opacity-100 hover:bg-white hover:text-black p-[1px] px-[3px] duration-200 group`}
						>
							Page 1/2
							<TriangleIcon className="ms-2 opacity-0 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
							<TriangleIcon
								className={`ms-2 absolute opacity-0 group-hover:opacity-100 duration-200 right-[-7px] lg:w-4 lg:h-4 xl:w-5 xl:h-5 sm:w-3 sm:h-3`}
								dark
							/>
							<TriangleIcon
								className={`ms-2 absolute opacity-100 group-hover:opacity-0 duration-200 right-[-7px] lg:w-4 lg:h-4 xl:w-5 xl:h-5 sm:w-3 sm:h-3`}
							/>
						</button>
					</div>
				</div>

				{/* Page 2 focused */}
				<div
					className={`absolute ${
						!page1Selected && !focusedQuestion
							? "opacity-100 z-50"
							: "opacity-0 pointer-events-none"
					}`}
				>
					{faqGroup2.map((F) => (
						<ListItemButton
							key={F._key}
							onClick={() => setFocusedQuestion(F)}
							text={F.question}
							inverted={false}
							displace={3}
							className="mb-0 py-[2px]"
						/>
					))}
					<div className="flex justify-end ms-3 w-full">
						<button
							type="button"
							onClick={() => {
								setPage1Selected(true);
							}}
							className={`absolute flex items-center mt-2 group hover:bg-white hover:text-black p-[1px] px-[3px] xl:mt-3 duration-200 `}
						>
							<TriangleIcon className="ms-2 opacity-0 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
							<TriangleIcon
								className={`ms-2 absolute opacity-0 group-hover:opacity-100 duration-200 left-[-5px] rotate-180 lg:w-4 lg:h-4 xl:w-5 xl:h-5 sm:w-3 sm:h-3`}
								dark
							/>
							<TriangleIcon
								className={`ms-2 absolute opacity-100 group-hover:opacity-0 duration-200 left-[-5px] rotate-180 lg:w-4 lg:h-4 xl:w-5 xl:h-5 sm:w-3 sm:h-3`}
							/>
							Page 2/2
						</button>
					</div>
				</div>

				{/* Question is focused. */}
				<div
					className={`${
						focusedQuestion
							? "opacity-100 z-50"
							: "opacity-0 pointer-events-none"
					} duration-200 absolute h-[160px] md:h-[196px] lg:h-[240px] xl:h-[290px]`}
				>
					<div>
						<ListItemButton
							onClick={() => setFocusedQuestion(null)}
							className="mb-2 py-[2px]"
							text={focusedQuestion?.question}
							rotate="rotate-90"
							displace={4}
							inverted
						/>

						<p className="ms-2">{focusedQuestion?.answer}</p>
					</div>

					<div className="absolute bottom-0">
						<ListItemButton
							onClick={() => setFocusedQuestion(null)}
							className="py-[2px] min-w-[175px] xl:min-w-[200px]"
							text="Ask another question"
							rotate="rotate-180"
							displace={2}
							inverted={false}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FAQAccordion;
