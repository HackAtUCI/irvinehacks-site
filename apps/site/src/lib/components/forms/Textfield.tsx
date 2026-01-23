"use client";

import { useState } from "react";
import RequiredAsterisk from "./RequiredAsterisk";
import normalizeWhitespace from "@/lib/utils/normalizeWhitespace";
import getWordCount from "@/lib/utils/getWordCount";

interface TextfieldProps {
	name: string;
	labelText: string;
	containerClass: string;
	isRequired: boolean;
	maxWordCount?: number;
	maxCharCount?: number;
}

function truncateToWordCount(str: string, maxWords: number) {
	const normalized = normalizeWhitespace(str);
	const words = normalized.split(" ");
	return words.slice(0, maxWords).join(" ");
}

export default function Textfield({
	name,
	labelText,
	containerClass,
	isRequired,
	maxWordCount,
	maxCharCount = 1500,
}: TextfieldProps) {
	const [value, setValue] = useState("");

	const wordCount = getWordCount(value);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		let nextValue = e.target.value;

		// Enforce max characters
		if (maxCharCount !== undefined && nextValue.length > maxCharCount) {
			nextValue = nextValue.slice(0, maxCharCount);
		}

		// Allow deletion
		if (nextValue.length < value.length) {
			setValue(nextValue);
			return;
		}

		// Enforce max words
		if (maxWordCount !== undefined) {
			const nextWordCount = getWordCount(nextValue);

			if (nextWordCount > maxWordCount) {
				const truncated = truncateToWordCount(nextValue, maxWordCount);
				setValue(truncated);
				return;
			}
		}

		setValue(nextValue);
	};

	return (
		<div className={containerClass}>
			<div className="flex flex-col w-full">
				<label className="text-lg mb-2" htmlFor={name}>
					{labelText} {isRequired && <RequiredAsterisk />}
				</label>

				<textarea
					id={name}
					name={name}
					className="text-black bg-[#E1E1E1] p-3 h-48 resize-none rounded-xl"
					required={isRequired}
					maxLength={maxCharCount}
					value={value}
					onChange={handleChange}
				/>

				<div className="mt-2 text-sm text-[#E1E1E1]">
					{maxWordCount && (
						<span>
							{wordCount}/{maxWordCount} words
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
