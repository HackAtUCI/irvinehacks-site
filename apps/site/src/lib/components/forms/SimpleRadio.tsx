import { ReactNode } from "react";
import RequiredAsterisk from "./RequiredAsterisk";

interface SimpleRadioProps {
	name: string;
	values: Array<{
		labelText: string;
		inputValue: string;
	}>;
	title: string;
	titleClass: string;
	subtitle?: ReactNode;
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
	subtitle,
	containerClassTotal,
	containerClassInputLabels,
	containerClassValues,
	labelClass,
	isRequired,
}: SimpleRadioProps) {
	return (
		<div className={containerClassTotal}>
			<p className={titleClass}>
				{`${title} `}
				{isRequired && <RequiredAsterisk />}
				{subtitle && (
					<>
						<br />
						{subtitle}
					</>
				)}
			</p>
			<div className={containerClassValues}>
				{values.map((value, i) => {
					return (
						<div key={`${name}-${i}`} className={containerClassInputLabels}>
							<input
								type="radio"
								id={`option_${name}_${value.inputValue}`}
								name={name}
								value={value.inputValue}
								required={isRequired}
							/>
							<label
								htmlFor={`option_${name}_${value.inputValue}`}
								className={labelClass}
							>
								{value.labelText}
							</label>
						</div>
					);
				})}
			</div>
		</div>
	);
}
