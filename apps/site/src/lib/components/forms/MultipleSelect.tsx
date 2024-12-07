"use client";

import { useState, useEffect, useRef, forwardRef } from "react";

import RequiredAsterisk from "./RequiredAsterisk";

interface MultipleInputs {
	labelText: string;
	identifierId: string;
	values: Array<{ name: string; value: string; text: string }>;
	containerClass: string;
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

export default function MultipleSelect({
	labelText,
	identifierId,
	values,
	containerClass,
}: MultipleInputs) {
	const [isOtherChecked, setIsOtherChecked] = useState(false);
	const otherRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOtherChecked) {
			otherRef.current?.focus();
		}
	}, [isOtherChecked]);

	return (
		<div className={containerClass}>
			<p className="m-0 text-lg mb-4">
				{labelText} <RequiredAsterisk />
			</p>
			<div className="w-10/12 flex flex-col gap-2">
				{values.map((item, i) => {
					const keyAndId = `${identifierId}-${i}`;
					if (item.value === "other") {
						return (
							<div key={keyAndId} className="flex gap-2">
								<input
									id={keyAndId}
									type="checkbox"
									key={`option-${i}`}
									name={item.name}
									value={item.value}
									onChange={(e) => setIsOtherChecked(e.target.checked)}
								/>
								<label className="text-lg" htmlFor={keyAndId}>
									{item.text}
								</label>
								<OtherInput
									isChecked={isOtherChecked}
									name={`other_${item.name}`}
									ref={otherRef}
								/>
							</div>
						);
					}
					return (
						<div key={keyAndId} className="flex gap-2">
							<input
								id={keyAndId}
								type="checkbox"
								key={`option-${i}`}
								name={item.name}
								value={item.value}
							/>
							<label className="text-lg" htmlFor={keyAndId}>
								{item.text}
							</label>
						</div>
					);
				})}
			</div>
		</div>
	);
}
