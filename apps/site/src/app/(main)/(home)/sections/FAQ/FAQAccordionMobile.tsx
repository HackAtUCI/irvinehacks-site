"use client";

import React, { useState } from "react";
import Image from "next/image";

import ListItemButton from "./components/ListItemButton";
import { FAQAccordion, FAQ } from "./FAQ";

import SpeechMobile from "./assets/speech-mobile.svg";

const FAQAccordionMobile: React.FC<FAQAccordion> = ({ faq }) => {
	const [focusedQuestion, setFocusedQuestion] = useState<null | FAQ>(null);

	return (
		<div className="flex flex-1 justify-center sm:h-auto mt-60 sm:mt-8 mb-[-250px] sm:mb-0">
			{/* Changes size of parent component */}
			<div
				className={`z-0 ${
					focusedQuestion ? "h-[520px]" : "h-[965px]"
				} duration-200 transition-transform sm:hidden`}
			/>
			<div className="relative flex justify-center sm:hidden">
				<Image
					src={SpeechMobile}
					alt="Dialogue box background"
					className={`${
						focusedQuestion ? "mt-[-160px]" : "mt-[-275px]"
					} min-w-[450px] object-fill`}
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
								displace={1}
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
						displace={1}
						inverted
					/>

					<p>{focusedQuestion?.answer}</p>

					<div className="-bottom-2 absolute">
						<ListItemButton
							onClick={() => setFocusedQuestion(null)}
							text="Ask another question"
							rotate="rotate-180"
							displace={1}
							inverted={false}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FAQAccordionMobile;
