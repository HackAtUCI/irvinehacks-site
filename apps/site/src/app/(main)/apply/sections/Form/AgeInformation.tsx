import SimpleRadio from "@/lib/components/forms/SimpleRadio";

const yesNoOptions = [
	{
		id: "minor-yes",
		labelText: "Yes",
		inputValue: "Yes",
	},
	{
		id: "minor-no",
		labelText: "No",
		inputValue: "No",
	},
];

export default function AgeInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<div className="flex flex-col gap-5">
				<p className="m-0 text-lg">
					Because of limitations imposed by UCI, we are legally not allowed to
					host minors (those under 18) for IrvineHacks 2024. By answering yes,
					you affirm that you are and will be 18 years or older by January 26,
					2024.
				</p>
				<p className="text-[#FF2222] m-0 text-lg">
					We will be checking ID. If you are a minor, you will be turned away at
					the door.
				</p>
			</div>

			<SimpleRadio
				name="is_18_older"
				values={yesNoOptions}
				title="Will you be 18 years or older by January 26th, 2024?"
				titleClass="text-xl font-bold m-0 text-center"
				containerClassTotal="flex flex-col gap-1 w-full items-center"
				isRequired={true}
				labelClass="font-bold text-xl"
				containerClassInputLabels="flex gap-2 items-center"
				containerClassValues="flex gap-5"
			/>
		</div>
	);
}
