"use client";

import { useState } from "react";

interface SelectProps {
	name: string;
	labelText: string;
	IdentifierID: string;
	values: Array<any>;
}

interface IsChecked {
	isChecked: boolean;
	id: string;
}

const OtherInput = (props: IsChecked) => {
	if (props.isChecked) {
		return (
			<input
				type="text"
				name={`${props.id}-other`}
				className="border-b-2 p-1 h-6 border-black w-6/12"
				required
			/>
		);
	} else {
		return (
			<input
				type="text"
				name={`${props.id}-other`}
				className="border-b-2 p-1 h-6 border-black w-6/12 bg-transparent"
				disabled={true}
			/>
		);
	}
};

export default function SingleSelect(props: SelectProps) {
	const [isOtherChecked, setIsOtherChecked] = useState(false);

	// I'm not entirely sure whether we would like to erase the input on
	// other when it's checked off, so I'll leave that implementation
	// out for now
	return (
		<>
			<p className="m-0 text-lg mb-4">
				{props.labelText} <span className="text-[#FF2222]">*</span>
			</p>
			<div className="w-10/12 flex flex-col gap-2">
				{props.values.map((item, i) => {
					if (item.value == "other") {
						return (
							<div
								key={`${props.IdentifierID}-${i}`}
								className="flex gap-2"
							>
								<input
									id={`${props.IdentifierID}-${i}`}
									type="radio"
									key={`option-${i}`}
									name={props.name}
									value={item.value}
									onChange={(e) =>
										setIsOtherChecked(e.target.checked)
									}
									required
								/>
								<label
									className="text-lg"
									htmlFor={`${props.IdentifierID}-${i}`}
								>
									{item.text}
								</label>
								<OtherInput
									isChecked={isOtherChecked}
									id={props.IdentifierID}
								/>
							</div>
						);
					}
					return (
						<div
							key={`${props.IdentifierID}-${i}`}
							className="flex gap-2"
						>
							<input
								id={`${props.IdentifierID}-${i}`}
								type="radio"
								key={`option-${i}`}
								name={props.name}
								value={item.value}
								onChange={() => setIsOtherChecked(false)}
								required
							/>
							<label
								className="text-lg"
								htmlFor={`${props.IdentifierID}-${i}`}
							>
								{item.text}
							</label>
						</div>
					);
				})}
			</div>
		</>
	);
}
