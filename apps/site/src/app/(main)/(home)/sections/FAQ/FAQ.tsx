import Image from "next/image";

import { getQuestions } from "./getQuestions";
import FAQAccordionMobile from "./FAQAccordionMobile";
import FAQAccordionDesktop from "./FAQAccordionDesktop";

import { PortableText } from "@portabletext/react";
import sprite from "./assets/sprite.png";
import organizerTitle from "./assets/organizer-title.png";

export interface FAQAccordion {
	faq: FAQ[];
}

export interface FAQ {
	_key: string;
	question: JSX.Element;
	answer: JSX.Element;
}

const FAQ = async () => {
	const questions = await getQuestions();
	const faq = questions[0]["faqs"].map(({ _key, question, answer }) => ({
		_key,
		question: <strong className="w-10/12">{question}</strong>,
		answer: <PortableText value={answer} />,
	}));

	return (
		<section className="flex justify-center bg-no-repeat bg-cover bg-top mt-20 lg:mt-40">
			<div className="relative flex flex-col w-4/5 pb-7 justify-center">
				<h2 className="my-6 font-display sm:text-[2.5rem] text-white text-4xl xl:text-5xl text-center">
					Frequently Asked Questions
				</h2>
				<div className="mt-8 sm:mt-0 sm:flex sm:gap-6 sm:items-center sm:justify-center">
					<div className="sm:flex sm:gap-3 lg:gap-[40px] sm:items-center">
						<div className="flex justify-center items-center h-fit">
							<Image
								src={sprite}
								alt="Wise anteater"
								className={`
									h-fit mt-[-30px] w-[250px] duration-300
									sm:w-[180px] sm:min-w-[180px]
									md:w-[200px] md:min-w-[200px]
									lg:w-[240px] lg:min-w-[240px]
									xl:w-[300px] xl:min-w-[300px]
								`}
							/>
							<Image
								src={organizerTitle}
								alt="Wise anteater title"
								className={`
									hidden absolute sm:block h-fit duration-300
									w-40 md:w-48 lg:w-60 xl:w-72
									sm:top-[270px] md:top-[290px] lg:top-[330px] xl:top-[380px]
								`}
							/>
						</div>
						<FAQAccordionDesktop faq={faq} />
						<FAQAccordionMobile faq={faq} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default FAQ;
