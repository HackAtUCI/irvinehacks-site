import Image from "next/image";

import PrizeCard from "./PrizeCard";
import MetaQuest from "@/assets/images/meta.png";
import Scooter from "@/assets/images/scooter.png";
import BoseImage from "@/assets/images/bose.png";
import Walle from "@/assets/images/walle.png";
import Roots from "@/assets/images/roots.png";
import QualcommLogo from "@/assets/images/qualcomm_logo_white.png";
import DroneImage from "@/assets/images/Drone.png";
import OpennoteLogo from "@/assets/images/Opennote_full_light 1.png";
import IpadImage from "@/assets/images/ipad.png";
import FirstAmericanLogo from "@/assets/images/FirstAmerican Logo White 1.png";

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
					<PrizeCard title="Most Innovative Use of Arduino UNO Q Board">
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

				<div className="flex flex-col items-center w-full mt-20">
					<div className="relative mx-auto w-[350px] lg:w-[500px] mb-12">
						<Image
							src={OpennoteLogo}
							alt="Opennote"
							style={{ objectFit: "contain" }}
						/>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-10">
						<PrizeCard title="Best UI/UX Hack (1st Place)">
							<div className="flex items-center justify-center gap-4 md:gap-8 mt-2">
								<div className="flex flex-col items-center">
									<div className="relative w-24 h-32">
										<Image
											src={IpadImage}
											alt="iPad"
											fill
											style={{ objectFit: "contain" }}
										/>
									</div>
									<p className="font-display text-turquoise text-lg uppercase [text-shadow:0_0_8px_#00ffff]">
										IPAD
									</p>
								</div>
								<span className="font-display text-white text-4xl [text-shadow:0_0_10px_#ffffff]">
									+
								</span>
								<div className="flex flex-col items-center gap-2">
									<span className="font-display text-white text-5xl [text-shadow:0_0_15px_rgba(255,255,255,0.8)]">
										$100
									</span>
									<p className="font-sans text-turquoise text-xs md:text-sm uppercase m-0 [text-shadow:0_0_8px_#00ffff]">
										Worth of <br /> Opennote Merch
									</p>
								</div>
							</div>
						</PrizeCard>

						<PrizeCard title="Best UI/UX Hack (2nd Place)">
							<div className="flex items-center justify-center gap-6 my-8">
								<div className="flex flex-col items-center gap-2">
									<span className="font-display text-white text-5xl [text-shadow:0_0_15px_rgba(255,255,255,0.8)]">
										$150
									</span>
									<p className="font-sans text-turquoise text-xs md:text-sm uppercase m-0 [text-shadow:0_0_8px_#00ffff]">
										For Each <br /> Team Member
									</p>
								</div>
								<span className="font-display text-white text-4xl [text-shadow:0_0_10px_#ffffff]">
									+
								</span>
								<div className="flex flex-col items-center gap-2">
									<span className="font-display text-white text-5xl [text-shadow:0_0_15px_rgba(255,255,255,0.8)]">
										$50
									</span>
									<p className="font-sans text-turquoise text-xs md:text-sm uppercase m-0 [text-shadow:0_0_8px_#00ffff]">
										Worth of <br /> Opennote Merch
									</p>
								</div>
							</div>
						</PrizeCard>
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-10">
					<div className="flex flex-col items-center">
						<div className="relative w-80 h-32 my-4">
							<Image
								src={FirstAmericanLogo}
								alt="First American"
								fill
								style={{ objectFit: "contain" }}
							/>
						</div>
						<PrizeCard title="Best Use of AI in Real Estate">
							<div className="flex flex-col items-center gap-2 px-2">
								<div className="flex items-center justify-center gap-4 mt-2">
									<span className="font-display text-white text-5xl [text-shadow:0_0_15px_rgba(255,255,255,0.8)]">
										$150
									</span>
									<p className="font-sans text-turquoise text-xs uppercase m-0 text-left [text-shadow:0_0_8px_#00ffff]">
										Worth of First <br /> American Merch
									</p>
								</div>
								<span className="font-display text-white text-4xl [text-shadow:0_0_10px_#ffffff]">
									+
								</span>
								<p className="font-sans text-white text-xs uppercase m-0 max-w-[280px] [text-shadow:0_0_10px_#ffffff]">
									Guaranteed First Round Interviews for Summer &apos;26
									Internships for Each Member
								</p>
							</div>
						</PrizeCard>
					</div>

					<div className="flex flex-col items-center">
						<span className="font-display text-white text-2xl uppercase tracking-widest my-16 [text-shadow:0_0_8px_#ffffff]">
							AI Safety at UCI
						</span>
						<PrizeCard title="Best AI Safety Hack">
							<div className="flex flex-col items-center gap-2 px-2">
								<div className="flex items-center justify-center gap-4 mt-2">
									<span className="font-display text-white text-5xl [text-shadow:0_0_15px_rgba(255,255,255,0.8)]">
										$50
									</span>
									<p className="font-sans text-turquoise text-xs uppercase m-0 text-left [text-shadow:0_0_8px_#00ffff]">
										Visa Gift Card <br /> for Each Member
									</p>
								</div>
								<span className="font-display text-white text-4xl [text-shadow:0_0_10px_#ffffff]">
									+
								</span>
								<p className="font-sans text-white text-xs uppercase m-0 [text-shadow:0_0_10px_#ffffff]">
									Instant Admission to <br /> Tech Fellowship
								</p>
							</div>
						</PrizeCard>
					</div>
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
