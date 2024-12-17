"use client";

import React, { useState } from "react";
import Image from "next/image";

import ListItemButton from "./components/ListItemButton";
import TriangleIcon from "./components/TriangleIcon";
import { FAQAccordion, FAQ } from "./FAQ";

import SpeechDesktop from "./assets/speech-desktop.svg";

const FAQAccordionDesktop: React.FC<FAQAccordion> = ({ faq }) => {
	const faqGroup1 = faq.slice(0, 8);
	const faqGroup2 = faq.slice(8);

	const [page1Selected, setPage1Selected] = useState<boolean>(true);

	const [focusedQuestion, setFocusedQuestion] = useState<null | FAQ>(null);

	return (
		<div className="flex flex-1 justify-center lg:h-auto mt-16 lg:mt-8 mb-[-250px] lg:mb-0">
			{/* Desktop View */}
			<Image
				src={SpeechDesktop}
				alt="Dialogue box background"
				className="hidden lg:block h-fit  lg:max-w-[630px] lg:h-[310px] xl:max-w-[775px] xl:h-[350px] duration-300"
			/>
			<div className="hidden lg:block absolute lg:w-[555px] xl:w-[685px] lg:text-[.85rem] xl:text-[1rem] mt-3">
				{/* Page 1 focused */}
				<div
					className={`absolute w-full duration-300 ${
						page1Selected && !focusedQuestion
							? "z-50"
							: "hidden pointer-events-none"
					}`}
				>
					{faqGroup1.map((F) => (
						<ListItemButton
							key={F._key}
							onClick={() => setFocusedQuestion(F)}
							text={F.question}
							inverted={false}
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
								className={`ms-2 absolute hidden group-hover:block duration-200 right-[-7px] lg:w-4 lg:h-4 xl:w-5 xl:h-5`}
								dark
							/>
							<TriangleIcon
								className={`ms-2 absolute group-hover:hidden duration-200 right-[-7px] lg:w-4 lg:h-4 xl:w-5 xl:h-5`}
							/>
						</button>
					</div>
				</div>

				{/* Page 2 focused */}
				<div
					className={`absolute ${
						!page1Selected && !focusedQuestion
							? "z-50"
							: "hidden pointer-events-none"
					}`}
				>
					{faqGroup2.map((F) => (
						<ListItemButton
							key={F._key}
							onClick={() => setFocusedQuestion(F)}
							text={F.question}
							inverted={false}
							className="mb-0 py-[2px]"
						/>
					))}
					<div className="flex justify-end ms-3 w-full">
						<button
							type="button"
							onClick={() => {
								setPage1Selected(true);
							}}
							className={`absolute flex items-center mt-4 group hover:bg-white hover:text-black p-[1px] px-[3px] xl:mt-4 duration-200 `}
						>
							<TriangleIcon className="ms-2 hidden lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
							<TriangleIcon
								className={`ms-2 absolute hidden group-hover:block duration-200 left-[-5px] rotate-180 lg:w-4 lg:h-4 xl:w-5 xl:h-5`}
								dark
							/>
							<TriangleIcon
								className={`ms-2 absolute group-hover:hidden duration-200 left-[-5px] rotate-180 lg:w-4 lg:h-4 xl:w-5 xl:h-5`}
							/>
							Page 2/2
						</button>
					</div>
				</div>

				{/* Question is focused. */}
				<div
					className={`${
						focusedQuestion
							? "z-50"
							: "hidden pointer-events-none"
					} duration-200 absolute lg:h-[250px] xl:h-[285px]`}
				>
					<div>
						<ListItemButton
							onClick={() => setFocusedQuestion(null)}
							className="mb-2 py-[2px]"
							text={focusedQuestion?.question}
							rotate="rotate-90"
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
							inverted={false}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FAQAccordionDesktop;
