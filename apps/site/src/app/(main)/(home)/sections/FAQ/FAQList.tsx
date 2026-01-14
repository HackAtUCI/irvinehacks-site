"use client";

import { useState } from "react";
import { PortableText } from "@portabletext/react";
import { FAQ } from "./FAQ";

const FAQList = ({ faqs }: { faqs: FAQ[] }) => {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	return (
		<div className="w-full pl-12 pt-3">
			{faqs.map((faq, index) => (
				<div key={faq._key}>
					<button
						type="button"
						onClick={() =>
							setSelectedIndex(selectedIndex === index ? null : index)
						}
						className="w-full text-left text-cyan-300 hover:underline flex items-start px-4 py-3 transition-all duration-200"
					>
						<div className="w-24 sm:w-32 text-base sm:text-lg flex-shrink-0">
							{index + 1}.
						</div>
						<div className="flex-1 text-base sm:text-lg">{faq.question}</div>
					</button>

					{selectedIndex === index && (
						<div className="px-2 py-6 text-cyan-100">
							<div className="pl-24 sm:pl-32 prose prose-invert max-w-none">
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
