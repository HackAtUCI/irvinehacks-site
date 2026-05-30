"use client";

import RequiredAsterisk from "./RequiredAsterisk";
import { useDraftContext } from "./shared/DraftContext";

interface TextProps {
	name: string;
	labelText: string;
	containerClass: string;
	type: string;
	placeholder: string;
	isRequired: boolean;
}

export default function TextInput({
	name,
	labelText,
	containerClass,
	placeholder,
	type,
	isRequired,
}: TextProps) {
	const draftContext = useDraftContext();
	const initial = draftContext?.initialValues[name];
	const defaultValue = typeof initial === "string" ? initial : "";

	return (
		<div className={containerClass}>
			<label className="text-lg mb-2" htmlFor={name}>
				{`${labelText} `} {isRequired && <RequiredAsterisk />}
			</label>
			<input
				className="bg-[#e1e1e1] text-[var(--color-black)] text-lg h-10 p-1.5 rounded-md"
				type={type}
				name={name}
				id={name}
				required={isRequired}
				placeholder={placeholder}
				defaultValue={defaultValue}
				onChange={(e) => draftContext?.setValue(name, e.target.value)}
			/>
		</div>
	);
}
