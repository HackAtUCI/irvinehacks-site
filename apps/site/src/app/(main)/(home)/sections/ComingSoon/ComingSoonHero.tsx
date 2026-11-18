"use client";

import Image from "next/image";

import heroBase from "@/assets/coming-soon/hero-base.png";
import heroRightDoor from "@/assets/coming-soon/hero-right-door.png";
import heroLeftDoor from "@/assets/coming-soon/hero-left-door.png";
import heroOverlay from "@/assets/coming-soon/hero-overlay.png";
import comingSoonSticker from "@/assets/coming-soon/coming-soon-sticker.svg";

export default function ComingSoonHero() {
	const handleStickerClick = () => {
		const target = document.getElementById("interest-forms");
		if (target) {
			target.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<section className="relative h-[580px] w-full overflow-hidden bg-cream sm:h-[780px] lg:h-[1080px]">
			{/* Layered storefront & doors (kept separate for future door animations) */}
			<div className="pointer-events-none absolute inset-0">
				<Image
					src={heroBase}
					alt="IrvineHacks 2027 storefront background"
					fill
					priority
					className="object-cover object-center"
				/>
				<Image
					src={heroRightDoor}
					alt=""
					aria-hidden="true"
					fill
					priority
					className="object-cover object-center"
				/>
				<Image
					src={heroLeftDoor}
					alt=""
					aria-hidden="true"
					fill
					priority
					className="object-cover object-center"
				/>
				<Image
					src={heroOverlay}
					alt=""
					aria-hidden="true"
					fill
					priority
					className="object-cover object-center mix-blend-multiply"
				/>
			</div>

			{/* Blur + dim layer over doors */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-b from-transparent to-[rgba(102,102,102,0.4)] backdrop-blur-[5px]"
			/>

			{/* Coming Soon interactive sticker */}
			<div className="relative z-10 flex h-full w-full items-end justify-center pb-12 sm:pb-20 lg:pb-[110px]">
				<button
					type="button"
					onClick={handleStickerClick}
					aria-label="Scroll to interest forms"
					className="group relative flex h-[230px] w-[350px] cursor-pointer items-center justify-center transition-transform duration-200 ease-out hover:scale-105 active:scale-95 sm:h-[310px] sm:w-[490px] lg:h-[391px] lg:w-[621px]"
				>
					<Image
						src={comingSoonSticker}
						alt=""
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 h-full w-full rotate-[4.56deg] object-contain"
					/>

					<div className="relative z-10 flex rotate-[4.56deg] flex-col items-center justify-center text-center">
						<h1 className="m-0 font-storefront text-[38px] font-normal leading-[1.08] text-sticker-green sm:text-[56px] lg:text-[76px] lg:leading-[84px]">
							Coming Soon..
						</h1>
						<p className="m-0 mt-1 font-nunito text-[15px] font-semibold leading-snug text-sticker-green sm:text-[20px] lg:text-[24px] lg:leading-[30px]">
							Confirm your interest below!
						</p>
						<span
							aria-hidden="true"
							className="absolute left-1/2 top-full mt-3 inline-block -translate-x-1/2 rotate-[90deg] font-handwritten text-[28px] leading-none text-ih-blue transition-transform duration-200 group-hover:translate-y-1 sm:mt-5 sm:text-[34px] lg:mt-7 lg:text-[40px]"
						>
							&gt;&gt;
						</span>
					</div>
				</button>
			</div>
		</section>
	);
}
