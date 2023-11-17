import { getQuestions } from "./getQuestions";
import FAQAccordion from "./FAQAccordion";

import { PortableText } from "@portabletext/react";
import styles from "./FAQ.module.scss";

const FAQ = async () => {
	const questions = await getQuestions();
	const faq = questions[0]["faqs"].map(({ _key, question, answer }) => ({
		_key: _key,
		question: <strong>{question}</strong>,
		answer: <PortableText value={answer} />,
	}));

	return (
		<section className={styles.container}>
			<div className={styles.faq}>
				<h2
					className={`font-display sm:!text-[4.5rem] ${styles.title}`}
				>
					FAQ
				</h2>
				<FAQAccordion faq={faq} />
			</div>
		</section>
	);
};

export default FAQ;
