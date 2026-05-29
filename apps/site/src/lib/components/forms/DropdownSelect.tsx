"use client";

import { useState } from "react";

import RequiredAsterisk from "./RequiredAsterisk";
import { useDraftContext } from "./shared/DraftContext";

interface SelectProps {
	name: string;
	labelText: string;
	values: Array<{ value: string; text: string }>;
	containerClass: string;
}

interface OtherProps {
	value: string;
	name: string;
	defaultValue: string;
	onChange: (value: string) => void;
}

const OtherPopup = ({ value, name, defaultValue, onChange }: OtherProps) => {
	if (value === "other") {
		return (
			<div className="mt-2 flex gap-2">
				<label htmlFor={`${name}-other-input`} className="text-lg">
					Other: <RequiredAsterisk />
				</label>
				<input
					type="text"
					name={`_other_${name}`}
					id={`${name}-other-input`}
					className="text-black border-b-2 p-1 h-6 border-black w-6/12"
					required
					defaultValue={defaultValue}
					onChange={(e) => onChange(e.target.value)}
				/>
			</div>
		);
	}
};

export default function DropdownSelect({
	name,
	labelText,
	values,
	containerClass,
}: SelectProps) {
	const draftContext = useDraftContext();
	const initial = draftContext?.initialValues[name];
	const initialValue = typeof initial === "string" ? initial : "";

	const otherFieldName = `_other_${name}`;
	const initialOther = draftContext?.initialValues[otherFieldName];
	const initialOtherValue =
		typeof initialOther === "string" ? initialOther : "";

	const [value, setValue] = useState(initialValue);

	return (
		<div className={containerClass}>
			<label className="text-lg mb-2" htmlFor={name}>
				{labelText} <RequiredAsterisk />
			</label>
			<select
				className="bg-[#e1e1e1] text-[var(--color-black)] text-lg h-10 p-1.5 rounded-md"
				name={name}
				id={name}
				defaultValue={initialValue}
				onChange={(e) => {
					setValue(e.target.value);
					draftContext?.setValue(name, e.target.value);
				}}
				required
			>
				<option value="" disabled />
				{values.map((item, i) => {
					return (
						<option key={`option-${i}`} value={item.value}>
							{item.text}
						</option>
					);
				})}
			</select>
			<OtherPopup
				value={value}
				name={name}
				defaultValue={initialOtherValue}
				onChange={(next) => draftContext?.setValue(otherFieldName, next)}
			/>
		</div>
	);
}
