import MultipleSelect from "@/lib/components/forms/MultipleSelect";
import { MultipleSelectSet } from "@/lib/components/forms/MultipleSelectSet/MultipleSelectSet";
import RequiredAsterisk from "@/lib/components/forms/RequiredAsterisk";
import Slider from "@/lib/components/forms/Slider";
import Textfield from "@/lib/components/forms/Textfield";

const techExperienceOptions = [
	{ value: "python", text: "Python" },
	{ value: "java", text: "Java" },
	{ value: "cpp", text: "C++" },
	{ value: "javascript", text: "JavaScript" },
	{ value: "typescript", text: "TypeScript" },
	{ value: "html_css", text: "HTML/CSS" },
	{ value: "react", text: "React.js" },
	{ value: "nextjs", text: "Next.js" },
	{ value: "csharp", text: "C#" },
	{ value: "unity", text: "Unity UE5" },
	{ value: "godot", text: "Godot" },
	{ value: "git", text: "Git" },
	{ value: "sql", text: "SQL" },
	{ value: "aws", text: "AWS" },
	{ value: "vercel", text: "Vercel" },
	{ value: "other", text: "Other:" },
];

const hardwareExperienceOptions = [
	{ value: "arduino", text: "Arduino" },
	{ value: "arduino_ide", text: "Arduino IDE" },
	{ value: "embedded_c_cpp", text: "Embedded C/C++" },
	{ value: "embedded_systems", text: "Embedded Systems" },
	{ value: "breadboard_circuits", text: "Breadboard Circuits" },
	{ value: "circuit_prototyping", text: "Circuit Prototyping" },
	{ value: "sensors_actuators", text: "Sensors & Actuators" },
	{ value: "multimeter", text: "Multimeter" },
	{ value: "reading_datasheets", text: "Reading Datasheets" },
	{
		value: "serial_communication",
		text: "Serial Communication (UART/I2C/SPI)",
	},
	{ value: "hardware_debugging", text: "Hardware Debugging" },
	{ value: "power_management", text: "Power Management" },
	{ value: "other", text: "Other:" },
];

const designToolOptions = [
	{ value: "figma", text: "Figma" },
	{ value: "affinity", text: "Affinity" },
	{ value: "photoshop", text: "Adobe Photoshop" },
	{ value: "illustrator", text: "Illustrator" },
	{ value: "framer", text: "Framer" },
	{ value: "indesign", text: "Adobe InDesign" },
	{ value: "other", text: "Other:" },
];

interface ExperienceInformationProps {
	isTechMentor: boolean;
	isDesignMentor: boolean;
	hidden: boolean;
}

function TechMentorQuestions({ isTechMentor }: { isTechMentor: boolean }) {
	return (
		<div className={`${!isTechMentor && "hidden"} flex flex-col gap-20`}>
			<div className="flex flex-col gap-20 w-full">
				<Slider
					containerClass="w-full"
					labelText="Rate your experience with Git:"
					pretext="No Experience"
					postText="Expert"
					name="git_experience"
				/>
				<Slider
					containerClass="w-full"
					labelText="Rate your experience with Arduino IDE:"
					pretext="No Experience"
					postText="Expert"
					name="arduino_experience"
				/>
			</div>
			<MultipleSelectSet
				className="flex flex-col gap-10 w-full"
				labelText="List of Technical Skills"
				isRequired
			>
				<div className="w-full flex flex-col gap-10 sm:gap-0 sm:flex-row">
					<div className="w-full sm:w-1/2">
						<p className="text-2xl m-0 font-bold max-[700px]:text-1xl">Tech</p>
						<MultipleSelect
							name="tech_experienced_technologies"
							labelText=""
							containerClass="w-full"
							inputType="checkbox"
							values={techExperienceOptions}
						/>
					</div>
					<div className="w-full sm:w-1/2">
						<p className="text-2xl m-0 font-bold max-[700px]:text-1xl">
							Hardware
						</p>
						<MultipleSelect
							name="hardware_experienced_technologies"
							labelText=""
							containerClass="w-full"
							inputType="checkbox"
							values={hardwareExperienceOptions}
						/>
					</div>
				</div>
			</MultipleSelectSet>
		</div>
	);
}

function DesignMentorQuestions({
	isDesignMentor,
}: {
	isDesignMentor: boolean;
}) {
	return (
		<div className={`${!isDesignMentor && "hidden"} flex flex-col gap-20`}>
			<div className="flex flex-col gap-20 w-full">
				<Slider
					containerClass="w-full"
					labelText="Rate your experience with Figma:"
					pretext="No Experience"
					postText="Expert"
					name="figma_experience"
				/>
			</div>
			<div className="flex flex-col gap-10 w-full">
				<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">
					List of Design Tools <RequiredAsterisk />
				</p>
				<div className="w-full flex flex-col gap-10 sm:gap-0 sm:flex-row">
					<MultipleSelect
						name="design_experienced_tools"
						labelText=""
						containerClass="w-full"
						inputType="checkbox"
						values={designToolOptions}
						isRequired={isDesignMentor}
					/>
				</div>
			</div>
		</div>
	);
}

export default function ExperienceInformation({
	isTechMentor,
	isDesignMentor,
	hidden,
}: ExperienceInformationProps) {
	return (
		<div className={`${hidden && "hidden"} flex flex-col gap-20 w-11/12`}>
			<div className="flex flex-col gap-5 w-11/12">
				<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">
					Skills Showcase
				</p>
				<Textfield
					name="mentor_prev_experience_saq1"
					labelText="Have you participated or mentored at a hackathon before? If so, please list which ones. e.g. IrvineHacks 2024 (Hacker), ZotHacks 2024 (Mentor)"
					containerClass="flex flex-col w-full"
					isRequired={false}
					maxLength={1500}
				/>
			</div>

			<TechMentorQuestions isTechMentor={isTechMentor} />
			<DesignMentorQuestions isDesignMentor={isDesignMentor} />
		</div>
	);
}
