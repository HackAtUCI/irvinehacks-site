import RequiredAsterisk from "./RequiredAsterisk";

interface TextfieldProps {
	name: string;
	values: Array<{
		id: string;
		labelText: string;
		inputValue: string;
	}>;
	title: string;
	titleClass: string;
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
	containerClassTotal,
	containerClassInputLabels,
	containerClassValues,
	labelClass,
	isRequired,
}: TextfieldProps) {
	return (
		<div className={containerClassTotal}>
			<p className={titleClass}>
				{`${title} `}
				{isRequired && <RequiredAsterisk />}
			</p>
			<div className={containerClassValues}>
				{values.map((value, i) => {
					return (
						<div
							key={`${name}-${i}`}
							className={containerClassInputLabels}
						>
							<input
								type="radio"
								id={value.id}
								name={name}
								value={value.inputValue}
								required={isRequired}
							/>
							<label htmlFor={value.id} className={labelClass}>
								{value.labelText}
							</label>
						</div>
					);
				})}
			</div>
		</div>
	);
}
