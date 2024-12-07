interface SliderProps {
	pretext?: string;
	postText?: string;
	name: string;
}

interface SliderTickProps {
	leftPercentage: string;
	label: string;
}

const SliderTick = ({ leftPercentage, label }: SliderTickProps) => {
	return (
		<div className={`absolute h-full left-[${leftPercentage}]`}>
			<div className="rounded bg-white h-full w-[4px]" />
			<p className="absolute mt-4 left-[-50%]">{label}</p>
		</div>
	);
};

export default function Slider({ name, pretext, postText }: SliderProps) {
	return (
		<div className="flex gap-4 w-11/12">
			<p className="text-center">{pretext}</p>
			<div className="relative flex items-center w-full">
				<SliderTick leftPercentage="0.7%" label="1" />
				<SliderTick leftPercentage="25.2%" label="2" />
				<SliderTick leftPercentage="49.7%" label="3" />
				<SliderTick leftPercentage="74.3%" label="4" />
				<SliderTick leftPercentage="98.7%" label="5" />
				<input
					className="w-full h-2 bg-white appearance-none rounded-full z-10"
					type="range"
					min="1"
					max="5"
					step="1"
					id={name}
				/>
			</div>

			<div className="flex items-center">
				<p className="text-center m-0">{postText}</p>
			</div>
		</div>
	);
}
