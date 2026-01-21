"use client";

import { useState } from "react";
import { PortableText } from "@portabletext/react";
import { FAQ } from "./FAQ";

const FAQList = ({ faqs }: { faqs: FAQ[] }) => {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	return (
		<div className="w-full pl-0 lg:pl-20 pt-3">
			{faqs.map((faq, index) => (
				<div key={faq._key}>
					<button
						type="button"
						onClick={() =>
							setSelectedIndex(selectedIndex === index ? null : index)
						}
						className="w-full text-left text-turquoise hover:underline flex items-start px-3 sm:px-4 py-3 transition-all duration-200"
					>
						<div className="w-16 sm:w-20 lg:w-24 xl:w-32 text-sm sm:text-base lg:text-lg flex-shrink-0">
							{index + 1}.
						</div>
						<div className="flex-1 text-sm sm:text-base lg:text-lg">
							{faq.question}
						</div>
					</button>

					{selectedIndex === index && (
						<div className="px-3 sm:px-4 py-4 sm:py-6 text-turquoise">
							<div className="pl-16 sm:pl-20 lg:pl-24 xl:pl-32 prose prose-sm sm:prose-base prose-invert max-w-none">
								<PortableText value={faq.answer} />
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default FAQList;
