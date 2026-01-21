import RequiredAsterisk from "./RequiredAsterisk";

interface ControlledMultipleSelectProps {
	name: string;
	labelText: string;
	values: Array<{ value: string; text: string }>;
	controlledObject: Record<string, boolean>;
	setControlledObject: (controlledObject: Record<string, boolean>) => void;
	containerClass: string;
	inputType: "radio" | "checkbox";
	horizontal?: boolean;
	isRequired?: boolean;
}

export default function ControlledMultipleSelect({
	name,
	labelText,
	inputType,
	values,
	controlledObject,
	setControlledObject,
	containerClass,
	horizontal,
	isRequired,
}: ControlledMultipleSelectProps) {
	return (
		<div className={containerClass}>
			<p className="m-0 text-lg mb-4">
				{labelText} {isRequired && <RequiredAsterisk />}
			</p>
			<div
				className={`w-10/12 flex ${
					horizontal ? "flex-wrap gap-10" : "flex-col gap-2"
				}`}
			>
				{values.map((item, i) => (
					<div key={i} className="flex gap-2 items-center">
						<input
							id={`${name}-${i}`}
							type={inputType}
							key={`option-${i}`}
							name={name}
							value={item.value}
							onChange={() =>
								setControlledObject({
									...controlledObject,
									[item.value]: !controlledObject[item.value],
								})
							}
						/>
						<label className="text-lg" htmlFor={`${name}-${i}`}>
							{item.text}
						</label>
					</div>
				))}
			</div>
		</div>
	);
}
