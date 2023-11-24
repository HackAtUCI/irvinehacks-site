import { getQuestions } from "./getQuestions";
import FAQAccordion from "./FAQAccordion";

import { PortableText } from "@portabletext/react";
import styles from "./FAQ.module.scss";

const FAQ = async () => {
	const questions = await getQuestions();
	const faq = questions[0]["faqs"].map(({ _key, question, answer }) => ({
		_key,
		question: <strong className="w-10/12">{question}</strong>,
		answer: <PortableText value={answer} />,
	}));

	return (
		<section
			className={`${styles.container} rounded-[500rem/20rem] py-24 flex justify-center bg-no-repeat bg-cover bg-center bg-top`}
		>
			<div className="relative flex flex-col w-4/5 pb-7">
				<h2
					className={`${styles.title} my-6 font-display sm:!text-[4.5rem] text-[#fffce2] text-4xl text-center`}
				>
					FAQ
				</h2>
				<FAQAccordion faq={faq} />
			</div>
		</section>
	);
};

export default FAQ;
