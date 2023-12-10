import RequiredAsterisk from "../Components/RequiredAsterisk";

export default function AgeInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<div className="flex flex-col gap-5">
				<p className="m-0 text-lg">
					Because of limitations imposed by UCI, we are legally not
					allowed to host minors (those under 18) for IrvineHacks
					2024. By answering yes, you affirm that you are and will be
					18 years or older by January 26, 2024.
				</p>
				<p className="text-[#FF2222] m-0 text-lg">
					We will be checking ID. If you are a minor, you will be
					turned away at the door.
				</p>
			</div>

			<div className="flex flex-col gap-1 w-full items-center">
				<p className="text-xl font-bold m-0">
					Will you be 18 years or older by January 26th, 2024?{" "}
					<RequiredAsterisk />
				</p>
				<div className="flex gap-5">
					<div className="flex gap-2 items-center">
						<input
							type="radio"
							id="minor-yes"
							name="minor-check"
							value="Yes"
							required
						/>
						<label
							htmlFor="minor-yes"
							className="font-bold text-xl"
						>
							Yes
						</label>
					</div>
					<div className="flex gap-2 items-center">
						<input
							type="radio"
							id="minor-no"
							name="minor-check"
							value="No"
							required
						/>
						<label htmlFor="minor-no" className="font-bold text-xl">
							No
						</label>
					</div>
				</div>
			</div>
		</div>
	);
}
