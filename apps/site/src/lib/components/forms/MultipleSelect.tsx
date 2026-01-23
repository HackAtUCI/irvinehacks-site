"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import clsx from "clsx";

import RequiredAsterisk from "./RequiredAsterisk";
import { useMultipleSelectSet } from "./MultipleSelectSet/MultipleSelectSetContext";

interface MultipleSelectProps {
	name: string;
	labelText: string;
	values: Array<{ value: string; text: string }>;
	containerClass: string;
	inputType: "radio" | "checkbox";
	horizontal?: boolean;
	isRequired?: boolean;
	hidden?: boolean;
}

interface OtherInputProps {
	isChecked: boolean;
	name: string;
}

const OtherInput = forwardRef<HTMLInputElement, OtherInputProps>(
	({ isChecked, name }, ref) => (
		<input
			ref={ref}
			type="text"
			name={name}
			className={
				isChecked
					? "text-[var(--color-black)] border-b-2 p-1 h-6 border-black w-6/12"
					: "text-[var(--color-white)]border-b-2 p-1 h-6 border-black w-6/12 bg-transparent"
			}
			required={isChecked}
			disabled={!isChecked}
		/>
	),
);
OtherInput.displayName = "OtherInput";

// A miniscule input that will appear if none of the checkboxes/radios
// are checked. Used to enforce isRequired
const RequiredBlocker = () => (
	<input className="w-[1px] h-[1px] bg-black" required />
);

export default function MultipleSelect({
	name,
	labelText,
	inputType,
	values,
	containerClass,
	horizontal,
	isRequired,
	hidden,
}: MultipleSelectProps) {
	const [checkedValues, setCheckedValues] = useState<Set<string>>(new Set());
	const [isOtherChecked, setIsOtherChecked] = useState(false);
	const otherRef = useRef<HTMLInputElement>(null);

	const setContext = useMultipleSelectSet();
	const idRef = useRef(crypto.randomUUID());

	const anyChecked = checkedValues.size > 0 || isOtherChecked;

	useEffect(() => {
		if (isOtherChecked) {
			otherRef.current?.focus();
		}
	}, [isOtherChecked]);

	useEffect(() => {
		if (setContext) {
			setContext.reportChecked(idRef.current, anyChecked);
		}
	}, [anyChecked, setContext]);

	const handleCheckChange = (value: string, checked: boolean) => {
		setCheckedValues((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(value);
			} else {
				next.delete(value);
			}
			return next;
		});
	};

	return (
		<div className={clsx(hidden && "hidden", containerClass)}>
			<p className="m-0 text-lg mb-4">
				{labelText} {isRequired && <RequiredAsterisk />}
				{isRequired && !anyChecked && <RequiredBlocker />}
			</p>

			<div
				className={`w-full flex ${
					horizontal ? "flex-wrap gap-10" : "flex-col gap-2"
				}`}
			>
				{values.map((item, i) => {
					const inputId = `${name}-${i}`;
					if (item.value === "other") {
						return (
							<div key={item.value} className="flex gap-2 items-center">
								<input
									id={inputId}
									type={inputType}
									key={`option-${i}`}
									name={name}
									value={item.value}
									onChange={(e) => {
										setIsOtherChecked(e.target.checked);
										handleCheckChange(item.value, e.target.checked);
									}}
								/>
								<label className="text-lg" htmlFor={inputId}>
									{item.text}
								</label>
								<OtherInput
									isChecked={isOtherChecked}
									name={`_other_${name}`}
									ref={otherRef}
								/>
							</div>
						);
					}
					return (
						<div key={i} className="flex gap-2 items-center">
							<input
								id={inputId}
								type={inputType}
								key={`option-${i}`}
								name={name}
								value={item.value}
								onChange={(e) =>
									handleCheckChange(item.value, e.target.checked)
								}
							/>
							<label className="text-lg" htmlFor={inputId}>
								{item.text}
							</label>
						</div>
					);
				})}
			</div>
		</div>
	);
}
