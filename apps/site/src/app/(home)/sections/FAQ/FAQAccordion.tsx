// "use client";

// import Accordion from "react-bootstrap/Accordion";
import { Root, Item, Trigger, Content } from "@/lib/components/Accordion";

// import styles from "./FAQ.module.scss";

interface FAQAccordion {
	faq: {
		_key: string;
		question: JSX.Element;
		answer: JSX.Element;
	}[];
}

const FAQAccordion: React.FC<FAQAccordion> = ({ faq }) => {
	return (
		<Root className="font-body" type="single" collapsible>
			{faq.map(({ _key, question, answer }) => (
				<Item key={_key} value={_key}>
					<Trigger> {question}</Trigger>
					<Content> {answer}</Content>
				</Item>
			))}
		</Root>
	);
};

export default FAQAccordion;
