"use client";

import { useState, useEffect, useRef, forwardRef } from "react";

interface RadioInputs {
	name: string;
	labelText: string;
	IdentifierId: string;
	values: Array<{ value: string; text: string }>;
	containerClass: string;
}

interface IsChecked {
	isChecked: boolean;
	id: string;
}

const OtherInput = forwardRef<HTMLInputElement, IsChecked>(({ isChecked, id }, ref) => (
	<input
		ref={ref}
		type="text"
		name={`${id}-other`}
		className={
			isChecked
				? "border-b-2 p-1 h-6 border-black w-6/12"
				: "border-b-2 p-1 h-6 border-black w-6/12 bg-transparent"
		}
		required={isChecked ? true : false}
		disabled={isChecked ? false : true}
	/>
));

export default function RadioSelect({
	name,
	labelText,
	IdentifierId,
	values,
	containerClass,
}: RadioInputs) {
	const [isOtherChecked, setIsOtherChecked] = useState(false);
	const otherRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOtherChecked) {
			otherRef.current?.focus();
		}
	}, [isOtherChecked])

	return (
		<div className={containerClass}>
			<p className="m-0 text-lg mb-4">
				{labelText} <span className="text-[#FF2222]">*</span>
			</p>
			<div className="w-10/12 flex flex-col gap-2">
				{values.map((item, i) => {
					const keyandId = `${IdentifierId}-${i}`;
					if (item.value == "other") {
						return (
							<div key={keyandId} className="flex gap-2">
								<input
									id={keyandId}
									type="radio"
									key={`option-${i}`}
									name={name}
									value={item.value}
									onChange={(e) =>
										setIsOtherChecked(e.target.checked)
									}
									required
								/>
								<label className="text-lg" htmlFor={keyandId}>
									{item.text}
								</label>
								<OtherInput
									isChecked={isOtherChecked}
									id={IdentifierId}
									ref={otherRef}
								/>
							</div>
						);
					}
					return (
						<div key={keyandId} className="flex gap-2">
							<input
								id={keyandId}
								type="radio"
								key={`option-${i}`}
								name={name}
								value={item.value}
								onChange={() => setIsOtherChecked(false)}
								required
							/>
							<label className="text-lg" htmlFor={keyandId}>
								{item.text}
							</label>
						</div>
					);
				})}
			</div>
		</div>
	);
}
