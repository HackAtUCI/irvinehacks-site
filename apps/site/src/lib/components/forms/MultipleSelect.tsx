"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import clsx from "clsx";

import RequiredAsterisk from "./RequiredAsterisk";
import { useMultipleSelectSet } from "./MultipleSelectSet/MultipleSelectSetContext";
import { useDraftContext, DraftFieldValue } from "./shared/DraftContext";

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
	defaultValue: string;
	onChange: (value: string) => void;
}

const OtherInput = forwardRef<HTMLInputElement, OtherInputProps>(
	({ isChecked, name, defaultValue, onChange }, ref) => (
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
			defaultValue={defaultValue}
			onChange={(e) => onChange(e.target.value)}
		/>
	),
);
OtherInput.displayName = "OtherInput";

// A miniscule input that will appear if none of the checkboxes/radios
// are checked. Used to enforce isRequired
const RequiredBlocker = () => (
	<input className="w-[1px] h-[1px] bg-black" required />
);

function initialCheckedValues(
	name: string,
	inputType: "radio" | "checkbox",
	initialValues: Record<string, DraftFieldValue> | undefined,
): Set<string> {
	const initial = initialValues?.[name];
	if (inputType === "radio") {
		if (typeof initial === "string" && initial) {
			return new Set([initial]);
		}
		return new Set();
	}
	if (Array.isArray(initial)) {
		return new Set(
			initial.filter((value): value is string => typeof value === "string"),
		);
	}
	return new Set();
}

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
	const draftContext = useDraftContext();
	const otherFieldName = `_other_${name}`;

	const initialOther = draftContext?.initialValues[otherFieldName];
	const initialOtherValue =
		typeof initialOther === "string" ? initialOther : "";

	const [checkedValues, setCheckedValues] = useState(() =>
		initialCheckedValues(name, inputType, draftContext?.initialValues),
	);
	const [isOtherChecked, setIsOtherChecked] = useState(() =>
		checkedValues.has("other"),
	);
	const [otherText, setOtherText] = useState(initialOtherValue);
	const otherRef = useRef<HTMLInputElement>(null);

	const setContext = useMultipleSelectSet();
	const idRef = useRef(crypto.randomUUID());

	const anyChecked = checkedValues.size > 0 || isOtherChecked;

	const publishDraft = (
		nextChecked: Set<string>,
		nextOtherChecked: boolean,
		nextOtherText: string,
	) => {
		if (!draftContext) {
			return;
		}

		if (inputType === "radio") {
			const selected = nextChecked.values().next().value;
			if (selected) {
				draftContext.setValue(name, selected);
			}
		} else {
			draftContext.setValue(name, Array.from(nextChecked));
		}

		if (nextOtherChecked) {
			draftContext.setValue(otherFieldName, nextOtherText);
		}
	};

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

	const handleCheckChange = (
		value: string,
		checked: boolean,
		otherChecked = isOtherChecked,
	) => {
		setCheckedValues((prev) => {
			let next: Set<string>;
			if (inputType === "radio") {
				next = checked ? new Set([value]) : new Set();
			} else {
				next = new Set(prev);
				if (checked) {
					next.add(value);
				} else {
					next.delete(value);
				}
			}
			publishDraft(next, otherChecked, otherText);
			return next;
		});
	};

	const handleOtherTextChange = (text: string) => {
		setOtherText(text);
		publishDraft(checkedValues, isOtherChecked, text);
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
									checked={checkedValues.has(item.value)}
									onChange={(e) => {
										const checked = e.target.checked;
										setIsOtherChecked(checked);
										handleCheckChange(item.value, checked, checked);
									}}
								/>
								<label className="text-lg" htmlFor={inputId}>
									{item.text}
								</label>
								<OtherInput
									isChecked={isOtherChecked}
									name={otherFieldName}
									ref={otherRef}
									defaultValue={initialOtherValue}
									onChange={handleOtherTextChange}
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
								checked={checkedValues.has(item.value)}
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
