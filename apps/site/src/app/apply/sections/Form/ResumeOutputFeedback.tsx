interface OutputFeedbackProps {
	errorMessage: string;
	resumePath: string;
}

export default function OutputFeedBack({
	errorMessage,
	resumePath,
}: OutputFeedbackProps) {
	if (errorMessage) {
		return <span className="text-[#FF2222] text-xl">{errorMessage}</span>;
	}

	return (
		<span className="text-xl">
			{resumePath ? "Successfully uploaded " + resumePath : ""}
		</span>
	);
}
