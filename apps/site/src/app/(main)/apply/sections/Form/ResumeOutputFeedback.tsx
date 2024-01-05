interface OutputFeedbackProps {
	errorMessage: string;
	resumePath: string;
}

export default function OutputFeedBack({
	errorMessage,
	resumePath,
}: OutputFeedbackProps) {
	if (errorMessage) {
		return <span className="text-[red] italic">{errorMessage}</span>;
	}

	return (
		<span className="italic">
			{resumePath ? "Selected " + resumePath : ""}
		</span>
	);
}
