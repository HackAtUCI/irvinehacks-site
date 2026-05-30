"use client";

import { ReactNode } from "react";
import RequiredAsterisk from "./RequiredAsterisk";
import { useDraftContext } from "./shared/DraftContext";

interface SimpleRadioProps {
	name: string;
	values: Array<{
		labelText: string;
		inputValue: string;
	}>;
	title: string;
	titleClass: string;
	subtitle?: ReactNode;
	containerClassTotal: string;
	containerClassInputLabels: string;
	containerClassValues: string;
	labelClass: string;
	isRequired: boolean;
}

export default function SimpleRadio({
	name,
	values,
	title,
	titleClass,
	subtitle,
	containerClassTotal,
	containerClassInputLabels,
	containerClassValues,
	labelClass,
	isRequired,
}: SimpleRadioProps) {
	const draftContext = useDraftContext();
	const initial = draftContext?.initialValues[name];
	const initialValue = typeof initial === "string" ? initial : "";

	return (
		<div className={containerClassTotal}>
			<p className={titleClass}>
				{`${title} `}
				{isRequired && <RequiredAsterisk />}
				{subtitle && (
					<>
						<br />
						{subtitle}
					</>
				)}
			</p>
			<div className={containerClassValues}>
				{values.map((value, i) => {
					return (
						<div key={`${name}-${i}`} className={containerClassInputLabels}>
							<input
								type="radio"
								id={`option_${name}_${value.inputValue}`}
								name={name}
								value={value.inputValue}
								required={isRequired}
								defaultChecked={initialValue === value.inputValue}
								onChange={(e) => {
									if (e.target.checked) {
										draftContext?.setValue(name, value.inputValue);
									}
								}}
							/>
							<label
								htmlFor={`option_${name}_${value.inputValue}`}
								className={labelClass}
							>
								{value.labelText}
							</label>
						</div>
					);
				})}
			</div>
		</div>
	);
}
