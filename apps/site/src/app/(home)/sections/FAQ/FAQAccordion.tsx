import { Root, Item, Trigger, Content } from "@/lib/components/Accordion";

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
					<Trigger className="sm:!text-[1.5rem]"> {question}</Trigger>
					<Content> {answer}</Content>
				</Item>
			))}
		</Root>
	);
};

export default FAQAccordion;
