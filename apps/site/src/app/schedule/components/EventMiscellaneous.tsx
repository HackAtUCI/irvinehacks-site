interface EventMiscellaneousProps {
	title: string;
	startTime: Date;
	endTime: Date;
	description?: JSX.Element;
}

export default function EventMiscellaneous({
	title,
	startTime,
	endTime,
	description,
}: EventMiscellaneousProps) {
	const durationInMinutes = (+endTime - +startTime) / 60000;

	return (
		<div className="text-white bg-[#973228] p-5 mb-6 rounded-2xl text-right">
			<h3 className="text-2xl font-bold mb-3">{title}</h3>
			{description}
			<p>{durationInMinutes} minutes</p>
		</div>
	);
}
