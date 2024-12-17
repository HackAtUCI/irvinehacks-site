import RequiredAsterisk from "./RequiredAsterisk";

interface TextfieldProps {
	name: string;
	labelText: string;
	containerClass: string;
	isRequired: boolean;
	maxLength?: number;
}

export default function Textfield({
	name,
	labelText,
	containerClass,
	isRequired,
	maxLength,
}: TextfieldProps) {
	return (
		<div className={containerClass}>
			<div className="flex flex-col w-full">
				<label className="text-lg mb-2" htmlFor={name}>
					{`${labelText} `}
					{isRequired && <RequiredAsterisk />}
				</label>
				<textarea
					className="text-[var(--color-black)] bg-[#E1E1E1] p-3 h-48 resize-none rounded-xl"
					id={name}
					name={name}
					required={isRequired}
					maxLength={maxLength}
				/>
			</div>
		</div>
	);
}
