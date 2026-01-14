import { getQuestions } from "./getQuestions";
import FAQList from "./FAQList";

export interface FAQ {
	_key: string;
	question: string;
	answer: Array<{
		_key: string;
		markDefs: Array<{
			_type: string;
			href?: string;
			_key: string;
		}>;
		children: Array<{
			text: string;
			_key: string;
			_type: "span";
			marks: string[];
		}>;
		_type: "block";
		style: "normal";
	}>;
}

const FAQ = async () => {
	const questions = await getQuestions();
	const faqs = questions[0]["faqs"].map(({ _key, question, answer }) => ({
		_key,
		question,
		answer,
	}));

	return (
		<section className="flex justify-center bg-no-repeat bg-cover bg-top mt-20 lg:mt-40">
			<div className="relative flex flex-col w-4/5 max-w-5xl pb-7 justify-center">
				<h2 className="my-6 font-display text-pink text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl text-center">
					FAQ
				</h2>

				<div className="mt-8">
					<div className="flex items-stretch gap-4">
						<div className="bg-[#E5F200] w-12 sm:w-8 flex-shrink-0" />
						<div className="bg-[#E5F200] text-black font-display text-xl sm:text-2xl md:text-3xl flex items-center px-4 py-3 flex-1">
							<div className="w-24 sm:w-32">RANK</div>
							<div className="flex-1">NAME</div>
						</div>
					</div>

					<FAQList faqs={faqs} />
				</div>
			</div>
		</section>
	);
};

export default FAQ;
