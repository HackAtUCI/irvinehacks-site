"use client";

import React, { useState } from "react";
import Image from "next/image";

import ListItemButton from "./components/ListItemButton";
import { FAQAccordion, FAQ } from "./FAQ";

import SpeechMobile from "./assets/speech-mobile.svg";

const FAQAccordionMobile: React.FC<FAQAccordion> = ({ faq }) => {
	const [focusedQuestion, setFocusedQuestion] = useState<null | FAQ>(null);

	return (
		<div className="flex flex-1 justify-center lg:h-auto mt-60 lg:mt-8 mb-[-250px] lg:mb-0 sm:text-lg md:text-xl">
			{/* Changes size of parent component */}
			<div
				className={`z-0 ${
					focusedQuestion ? "h-[520px]" : "h-[965px] sm:h-[940px] md:h-[1030px]"
				} duration-200 transition-transform lg:hidden`}
			/>
			<div className="relative flex justify-center lg:hidden">
				<Image
					src={SpeechMobile}
					alt="Dialogue box background"
					className={`${
						focusedQuestion ? "mt-[-160px] sm:mt-[-120px] sm:max-h-[620px]" : "mt-[-275px] md:mt-[-300px]"
					} min-w-[450px] sm:min-w-[600px] md:min-w-[750px] object-fill`}
					layout="responsive"
				/>

				{/* No question is focused. */}
				<div
					className={`${
						focusedQuestion
							? "opacity-0 pointer-events-none"
							: "opacity-100 z-50"
					} duration-200 w-[325px] sm:w-[450px] md:w-[560px] absolute mx-4 mt-2 h-fit`}
				>
					<div>
						{faq.map((F) => (
							<ListItemButton
								key={F._key}
								onClick={() => setFocusedQuestion(F)}
								text={F.question}
								className="md:p-2"
								inverted={false}
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
					} duration-200 absolute w-[325px] sm:w-[450px] md:w-[570px] h-[350px] sm:h-[325px] mt-2 sm:mt-8`}
				>
					<ListItemButton
						onClick={() => setFocusedQuestion(null)}
						className="mb-3"
						text={focusedQuestion?.question}
						rotate="rotate-90"
						inverted
					/>

					<p>{focusedQuestion?.answer}</p>

					<div className="-bottom-2 absolute">
						<ListItemButton
							onClick={() => setFocusedQuestion(null)}
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

export default FAQAccordionMobile;
