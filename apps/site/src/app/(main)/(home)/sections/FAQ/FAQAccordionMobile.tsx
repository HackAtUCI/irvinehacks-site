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
			className={`relative flex flex-1 justify-center sm:text-lg md:text-xl lg:hidden ${
				focusedQuestion ? "h-[480px]" : "h-[965px] sm:h-[940px] md:h-[810px]"
			}`}
		>
			<Image
				src={SpeechMobile}
				alt="Dialogue box background"
				className={`duration-300 ${
					focusedQuestion
						? "w-[95%] h-[480px] sm:h-[375px] sm:max-h-[620px]"
						: "w-[300px] sm:w-[480px] md:w-[600px] h-[920px] sm:h-[745px] md:h-[800px]"
				}`}
			/>
			{focusedQuestion ? (
				<div
					className={
						"duration-300 absolute top-[35px] w-[85%] sm:w-[88%] h-[420px] sm:h-[325px]"
					}
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
			) : (
				<div
					className={
						"duration-300 w-[250px] sm:w-[450px] md:w-[560px] absolute top-14 sm:top-12 mx-4 h-fit"
					}
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
			)}
		</div>
	);
};

export default FAQAccordionMobile;
