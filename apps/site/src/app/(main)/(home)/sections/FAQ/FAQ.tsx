import Image from "next/image";

import { getQuestions } from "./getQuestions";
import FAQAccordion from "./FAQAccordion";

import { PortableText } from "@portabletext/react";
import sprite from "./sprite.png";
import organizerTitle from "./organizer-title.png";
import styles from "./FAQ.module.scss";

const FAQ = async () => {
	const questions = await getQuestions();
	const faq = questions[0]["faqs"].map(({ _key, question, answer }) => ({
		_key,
		question: <strong className="w-10/12">{question}</strong>,
		answer: <PortableText value={answer} />,
	}));

	return (
		<section className="flex justify-center bg-no-repeat bg-cover bg-center bg-top">
			<div className="relative flex flex-col w-4/5 pb-7 justify-center">
				<h2
					className={`${styles.title} my-6 font-display sm:text-[2.5rem] text-[#fffce2] text-4xl text-center`}
				>
					Frequently Asked Questions
				</h2>
				<div className="mt-8 sm:mt-0 sm:flex sm:gap-6 sm:items-center sm:justify-center">
					<div className="sm:flex sm:gap-3 lg:gap-[40px] sm:items-center">
						<div className="flex justify-center items-center h-fit">
							<Image
								src={sprite}
								alt="Wise anteater"
								className="w-[250px] h-fit sm:w-[180px] sm:min-w-[180px] mt-[-30px] md:w-[200px] md:min-w-[200px] lg:w-[240px] lg:min-w-[240px] xl:w-[300px] xl:min-w-[300px] duration-300"
							/>
							<Image
								src={organizerTitle}
								alt="Wise anteater title"
								className="hidden sm:block w-40 md:w-48 lg:w-60 xl:w-72 h-fit absolute sm:top-[270px] md:top-[290px] lg:top-[330px] xl:top-[380px] duration-300"
							/>
						</div>
						<FAQAccordion faq={faq} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default FAQ;
