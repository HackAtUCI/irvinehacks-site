import Image from "next/image";

import PrizeCard from "./PrizeCard";
import MetaQuest from "@/assets/images/meta.png";
import Scooter from "@/assets/images/scooter.png";
import BoseImage from "@/assets/images/bose.png";
import Walle from "@/assets/images/walle.png";
import Roots from "@/assets/images/roots.png";

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

export default function Prizes() {
	return (
		<section className="bg-[#00001c]">
			<div className="w-full pb-40 flex flex-col justify-center items-center">
				<PrizeTracks />
			</div>
		</section>
	);
}
