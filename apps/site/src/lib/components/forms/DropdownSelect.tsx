"use client";

import { useState } from "react";
import RequiredAsterisk from "./RequiredAsterisk";

interface SelectProps {
	labelStyle: string;
	inputStyle: string;
	name: string;
	labelText: string;
	values: Array<{ value: string; text: string }>;
	containerClass: string;
}

interface OtherProps {
	value: string;
	name: string;
}

const OtherPopup = ({ value, name }: OtherProps) => {
	if (value === "other") {
		return (
			<div className="mt-2 flex gap-2">
				<label htmlFor={`${name}-other-input`} className="text-lg">
					Other: <RequiredAsterisk />
				</label>
				<input
					type="text"
					name={`other_${name}`}
					id={`${name}-other-input`}
					className="border-b-2 p-1 h-6 border-black w-6/12"
					required
				/>
			</div>
		);
	}
};

export default function DropdownSelect({
	labelStyle,
	inputStyle,
	name,
	labelText,
	values,
	containerClass,
}: SelectProps) {
	const [value, setValue] = useState("");

	return (
		<div className={containerClass}>
			<label className={`${labelStyle}`} htmlFor={name}>
				{labelText} <RequiredAsterisk />
			</label>
			<select
				className={`${inputStyle}`}
				name={name}
				id={name}
				defaultValue={""}
				onChange={(e) => setValue(e.target.value)}
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
			<OtherPopup value={value} name={name} />
		</div>
	);
}
