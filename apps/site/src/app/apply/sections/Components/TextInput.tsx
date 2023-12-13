import RequiredAsterisk from "./RequiredAsterisk";

interface TextProps {
	name: string;
	labelClass: string;
	labelText: string;
	inputClass: string;
	containerClass: string;
	type: string;
	placeholder: string;
	isRequired: boolean;
}

export default function TextInput({
	name,
	labelClass,
	labelText,
	inputClass,
	containerClass,
	placeholder,
	type,
	isRequired,
}: TextProps) {
	return (
		<div className={containerClass}>
			<label className={labelClass} htmlFor={name}>
				{`${labelText} `} {!isRequired || <RequiredAsterisk />}
			</label>
			<input
				className={inputClass}
				type={type}
				name={name}
				id={name}
				required={isRequired}
				placeholder={placeholder}
			/>
		</div>
	);
}
