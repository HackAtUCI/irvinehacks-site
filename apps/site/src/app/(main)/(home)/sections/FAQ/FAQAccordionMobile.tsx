"use client";

import React, { useState } from "react";
import Image from "next/image";

import ListItemButton from "./components/ListItemButton";
import { FAQAccordion, FAQ } from "./FAQ";

import SpeechMobile from "./assets/speech-mobile.svg";

const FAQAccordionMobile: React.FC<FAQAccordion> = ({ faq }) => {
	const [focusedQuestion, setFocusedQuestion] = useState<null | FAQ>(null);

	return (
		<div
			className={`w-[100%] relative flex flex-1 justify-center sm:text-lg md:text-xl lg:hidden ${
				focusedQuestion ? "h-[480px]" : "h-[965px] sm:h-[940px] md:h-[1030px]"
			}`}
		>
			<Image
				src={SpeechMobile}
				alt="Dialogue box background"
				className={`${
					focusedQuestion
						? "w-[95%] h-[480px] sm:h-[375px] sm:max-h-[620px]"
						: ""
				}`}
			/>

			{/* No question is focused. */}
			<div
				className={`${
					focusedQuestion ? "hidden pointer-events-none" : "z-50"
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
					focusedQuestion ? "z-50" : "hidden pointer-events-none"
				} duration-200 absolute top-[35px] w-[85%] sm:w-[88%] h-[420px] sm:h-[325px]`}
			>
				<ListItemButton
					onClick={() => setFocusedQuestion(null)}
					className="mb-3"
					text={focusedQuestion?.question}
					rotate="rotate-90"
					inverted
				/>

				<p>{focusedQuestion?.answer}</p>

				<div className="-bottom-2 sm:bottom-0 absolute">
					<ListItemButton
						onClick={() => setFocusedQuestion(null)}
						text="Ask another question"
						rotate="rotate-180"
						inverted={false}
					/>
				</div>
			</div>
		</div>
	);
};

export default FAQAccordionMobile;
