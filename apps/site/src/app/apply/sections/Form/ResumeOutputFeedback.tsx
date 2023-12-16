interface outputFeedbackProps {
	errorMessage: string;
	resumePath: string;
}

export default function OutputFeedBack(props: outputFeedbackProps) {
	if (props.errorMessage) {
		return (
			<span className="text-[#FF2222] text-xl">{props.errorMessage}</span>
		);
	}

	return (
		<span className="text-xl">
			{props.resumePath
				? "Successfully uploaded " + props.resumePath
				: ""}
		</span>
	);
}
