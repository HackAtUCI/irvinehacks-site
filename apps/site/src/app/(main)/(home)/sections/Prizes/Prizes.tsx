import Image from "next/image";

import PrizeCard from "./PrizeCard";
import MetaQuest from "@/assets/images/meta.png";
import Scooter from "@/assets/images/scooter.png";
import BoseImage from "@/assets/images/bose.png";
import Walle from "@/assets/images/walle.png";
import Roots from "@/assets/images/roots.png";
import QualcommLogo from "@/assets/images/qualcomm_logo_white.png";
import DroneImage from "@/assets/images/Drone.png";

function PrizeTracks() {
	return (
		<div className="flex flex-col justify-center items-center gap-14 text-center px-6 md:px-20 max-w-[1500px]">
			<h2 className="font-display text-pink text-4xl md:text-6xl lg:text-8xl">
				Prize Tracks
			</h2>
			<div className="flex flex-wrap justify-center gap-10">
				<PrizeCard title="Best Overall">
					<div className="relative w-3/4 h-1/2 mb-4">
						<Image
							src={MetaQuest}
							alt="Meta Quest 3S (128GB)"
							fill
							style={{ objectFit: "contain" }}
						/>
					</div>
					<p className="font-sans text-lg md:text-xl m-0 [text-shadow:0_0_8px_#00ffff]">
						Meta Quest 3S (128GB)
					</p>
				</PrizeCard>
				<PrizeCard title="Best Runner Up">
					<div className="relative w-3/4 h-1/2 mb-4">
						<Image
							src={Scooter}
							alt="HIBOY Electric Scooter"
							fill
							style={{ objectFit: "contain" }}
						/>
					</div>
					<p className="font-sans text-lg md:text-xl m-0 [text-shadow:0_0_8px_#00ffff]">
						HIBOY S2 Pro Electric Scooter
					</p>
				</PrizeCard>
				<PrizeCard title="Hacker's Choice">
					<div className="relative w-3/4 h-1/2 mb-4">
						<Image
							src={BoseImage}
							alt="Bose Headphones"
							fill
							style={{ objectFit: "contain" }}
						/>
					</div>
					<p className="font-sans text-lg md:text-xl m-0 [text-shadow:0_0_8px_#00ffff]">
						Bose QuietComfort SC Headphones
					</p>
				</PrizeCard>
				<PrizeCard title="Best Beginner Hack">
					<div className="relative w-3/4 h-1/2 mb-4">
						<Image
							src={Walle}
							alt="Wall-E and Eve Lego Set"
							fill
							style={{ objectFit: "contain" }}
						/>
					</div>
					<p className="font-sans text-lg md:text-xl m-0 [text-shadow:0_0_8px_#00ffff]">
						Wall-E and Eve Lego Set
					</p>
				</PrizeCard>
				<PrizeCard title="Best Sustainable Hack">
					<div className="relative w-3/4 h-1/2 mb-4">
						<Image
							src={Roots}
							alt="Roots Bluetooth Speaker"
							fill
							style={{ objectFit: "contain" }}
						/>
					</div>
					<p className="font-sans text-lg md:text-xl m-0 [text-shadow:0_0_8px_#00ffff]">
						Roots Bluetooth Speaker
					</p>
				</PrizeCard>
			</div>
		</div>
	);
}

function SponsoredPrizeTracks() {
	return (
		<div className="flex flex-col justify-center items-center gap-14 text-center px-6 md:px-20 max-w-[1500px]">
			<h2 className="font-display text-pink text-4xl md:text-6xl lg:text-8xl">
				Sponsored Prize Tracks
			</h2>
			<div className="flex flex-wrap items-center justify-center gap-10">
				<div className="flex flex-col items-center">
					<div className="relative w-72 h-32">
						<Image
							src={QualcommLogo}
							alt="Qualcomm"
							fill
							style={{ objectFit: "contain" }}
						/>
					</div>
					<PrizeCard title="Most Innovative Use of Arduino Uno Q Board">
						<div className="flex flex-col items-center">
							<span className="font-display text-white text-6xl mt-6 [text-shadow:0_0_15px_rgba(255,255,255,0.8)]">
								$250
							</span>
							<p className="font-sans text-turquoise text-sm uppercase m-0 mt-6 [text-shadow:0_0_8px_#00ffff]">
								Cash Prize for Each Member
							</p>
						</div>
					</PrizeCard>
				</div>

				<div className="flex flex-col items-center">
					<span className="w-[375px] my-[32px] font-display text-white text-2xl uppercase tracking-widest [text-shadow:0_0_8px_#ffffff]">
						Cognitive Science Association at UCI
					</span>
					<PrizeCard title="Best Neuro Hack">
						<div className="flex flex-col items-center gap-2">
							<div className="relative w-64 h-48 my-2">
								<Image
									src={DroneImage}
									alt="Drone"
									fill
									style={{ objectFit: "contain" }}
								/>
							</div>
							<p className="font-sans text-turquoise text-lg uppercase m-0 mt-2 [text-shadow:0_0_8px_#00ffff]">
								Drone w/ Camera
							</p>
						</div>
					</PrizeCard>
				</div>
			</div>
		</div>
	);
}

export default function Prizes() {
	return (
		<section className="bg-[#00001c]">
			<div className="w-full pb-40 flex flex-col justify-center items-center gap-32">
				<PrizeTracks />
				<SponsoredPrizeTracks />
			</div>
		</section>
	);
}
