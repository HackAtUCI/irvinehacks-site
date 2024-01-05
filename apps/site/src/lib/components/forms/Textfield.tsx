import RequiredAsterisk from "./RequiredAsterisk";

interface TextfieldProps {
	name: string;
	labelClass: string;
	labelText: string;
	inputClass: string;
	containerClass: string;
	isRequired: boolean;
	maxLength?: number;
}

export default function Textfield({
	name,
	labelClass,
	labelText,
	inputClass,
	containerClass,
	isRequired,
	maxLength,
}: TextfieldProps) {
	return (
		<div className={containerClass}>
			<div className="flex flex-col w-full">
				<label className={labelClass} htmlFor={name}>
					{`${labelText} `}
					{isRequired && <RequiredAsterisk />}
				</label>
				<textarea
					className={inputClass}
					id={name}
					name={name}
					required={isRequired}
					maxLength={maxLength}
				/>
			</div>
		</div>
	);
}
