import RequiredAsterisk from "./RequiredAsterisk";

interface SliderProps {
	pretext?: string;
	postText?: string;
	name: string;
	containerClass: string;
	labelText: string;
}

interface SliderTickProps {
	leftPercentage: string;
	label: string;
}

const SliderTick = ({ leftPercentage, label }: SliderTickProps) => (
	<div className="absolute h-full" style={{ left: leftPercentage }}>
		<div className="rounded bg-white h-full w-[4px]" />
		<p className="absolute mt-4 left-[-50%]">{label}</p>
	</div>
);

export default function Slider({
	name,
	pretext,
	postText,
	containerClass,
	labelText,
}: SliderProps) {
	return (
		<div className={containerClass}>
			<p className="m-0 text-lg mb-4">
				{labelText} <RequiredAsterisk />
			</p>
			<div className="flex gap-4 w-full">
				<p className="hidden md:block text-center m-0">{pretext}</p>
				<div className="relative flex items-center min-h-[50px] w-full">
					<SliderTick leftPercentage="0.7%" label="1" />
					<SliderTick leftPercentage="25.2%" label="2" />
					<SliderTick leftPercentage="49.7%" label="3" />
					<SliderTick leftPercentage="74%" label="4" />
					<SliderTick leftPercentage="98.7%" label="5" />
					<input
						className="w-full h-2 bg-white appearance-none rounded-full z-10"
						type="range"
						min="1"
						max="5"
						step="1"
						name={name}
					/>
				</div>
				<div className="hidden md:block flex items-center">
					<p className="text-center m-0">{postText}</p>
				</div>
			</div>

			<div className="visible md:hidden flex justify-between w-full mt-14">
				<p className="text-center m-0">{pretext}</p>
				<p className="text-center m-0">{postText}</p>
			</div>
		</div>
	);
}
