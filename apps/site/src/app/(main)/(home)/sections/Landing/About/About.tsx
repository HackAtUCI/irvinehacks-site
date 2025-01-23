import Image from "next/image";
import QuestBox from "@/assets/images/text_box_with_title.svg";
import LgStar from "@/assets/images/large_star.svg";
import SmStar from "@/assets/images/small_star.svg";

const About = () => {
	return (
		<div className="w-full absolute bottom-0 lg:bottom-[30vh] flex justify-center aspect-[12/5] max-lg:[h-1000px]">
			<div className="w-full h-full absolute bottom-0 max-lg:hidden">
				<Image src={LgStar} alt="*" className="absolute top-[30%] left-10" />
				<Image
					src={SmStar}
					alt="*"
					className="absolute bottom-[30%] left-[7%]"
				/>

				<Image src={LgStar} alt="*" className="absolute bottom-0 left-20" />

				<Image src={LgStar} alt="*" className="absolute top-[40%] right-10" />
				<Image
					src={SmStar}
					alt="*"
					className="absolute bottom-[20%] right-[7%]"
				/>
			</div>

			<div className="absolute bottom-0 flex flex-col items-center w-[75%] max-w-[1200px] min-w-[750px] pb-10 max-2xl:bottom-[30%]">
				<p className="font-display text-3xl md:text-4xl font-bold mb-10 max-sm:max-w-[300px] text-center">
					3 Days, 400+ Hackers, $7,000+ in Prizes
				</p>

				<div className="h-auto w-auto relative flex justify-center">
					<div className="w-full h-full bg-white absolute mt-5 left-5" />
					<Image
						src={QuestBox}
						alt="quest box"
						className="relative z-0 min-w-[900px] max-lg:hidden"
					/>
					<div className="relative z-0 h-[600px] bg-[#0c071b] w-[400px] border-white border-4 hidden max-lg:block max-sm:w-[300px]" />
					<p className="font-display text-3xl max-lg:text-xl mt-3 absolute">
						Quest Unlocked
					</p>
					<div className="w-full h-full absolute text-center flex justify-center items-center z-1">
						<div className="w-[80%] h-[80%] flex flex-col justify-center items-center relative">
							<p className="font-display text-2xl mt-3 max-lg:text-xl max-xl:text-base max-2xl:text-xl max-sm:text-base">
								IrvineHacks is the largest collegiate hackathon in Orange
								County, and we continue expanding and improving our event every
								year. Our focus? - Enhance the community around us by giving
								students the platform to unleash their creativity in an
								environment of forward thinking individuals.
							</p>
							<p className="font-display text-2xl mt-3 max-lg:text-xl max-xl:text-base max-2xl:text-xl max-sm:text-base">
								This year, IrvineHacks will take place the weekend of January
								24th to 26th. The event will be 100% in-person during the day
								(not overnight). Free workshops, socials, food, and swag will be
								provided!
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default About;
