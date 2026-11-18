import Image, { StaticImageData } from "next/image";

import sodaCan from "@/assets/coming-soon/soda-can.svg";
import banana from "@/assets/coming-soon/banana.svg";
import ramune from "@/assets/coming-soon/ramune.svg";
import barcodeHacker from "@/assets/coming-soon/barcode-hacker.svg";
import barcodeJudge from "@/assets/coming-soon/barcode-judge.svg";
import barcodeMentor from "@/assets/coming-soon/barcode-mentor.svg";
import arrowLine from "@/assets/coming-soon/arrow-line.svg";
import flare1 from "@/assets/coming-soon/flare-1.svg";
import flare2 from "@/assets/coming-soon/flare-2.svg";
import flare3 from "@/assets/coming-soon/flare-3.svg";
import flare4 from "@/assets/coming-soon/flare-4.svg";

const INTEREST_FORM_URL = "https://forms.gle/piQ793jmrL2m99VP6";

interface CouponConfig {
	role: string;
	bgClass: string;
	textAccentClass: string;
	expColorClass: string;
	illustration: StaticImageData;
	illustrationClass: string;
	barcode: StaticImageData;
}

const COUPONS: CouponConfig[] = [
	{
		role: "Hacker",
		bgClass: "bg-coral",
		textAccentClass: "text-coral",
		expColorClass: "text-[#ff7830]",
		illustration: sodaCan,
		illustrationClass:
			"right-3 top-6 h-[64px] w-[40px] rotate-[11.64deg] sm:right-4 sm:top-7 sm:h-[67px] sm:w-[40px]",
		barcode: barcodeHacker,
	},
	{
		role: "Judge",
		bgClass: "bg-judge-pink",
		textAccentClass: "text-judge-pink",
		expColorClass: "text-ih-yellow",
		illustration: banana,
		illustrationClass:
			"right-2 top-3 h-[68px] w-[90px] rotate-[139.41deg] -scale-y-100 sm:right-3 sm:top-3 sm:h-[71px] sm:w-[96px]",
		barcode: barcodeJudge,
	},
	{
		role: "Mentor",
		bgClass: "bg-ih-blue",
		textAccentClass: "text-ih-blue",
		expColorClass: "text-[#25c3e6]",
		illustration: ramune,
		illustrationClass:
			"right-4 top-2 h-[96px] w-[34px] rotate-[15.4deg] sm:right-5 sm:top-3 sm:h-[105px] sm:w-[36px]",
		barcode: barcodeMentor,
	},
];

export default function InterestFormsSection() {
	return (
		<section
			id="interest-forms"
			className="relative w-full overflow-hidden bg-cream"
		>
			{/* Top wall & colored stripes */}
			<div aria-hidden="true" className="w-full">
				<div className="h-[48px] w-full bg-wall-line sm:h-[68px] lg:h-[86px]" />
				<div className="mt-3.5 h-[16px] w-full bg-stripe-blue sm:mt-5 lg:mt-[23px] lg:h-[26px]" />
				<div className="mt-1.5 h-[11px] w-full bg-stripe-green lg:mt-[9px] lg:h-[18px]" />
			</div>

			{/* Main content: What is IrvineHacks poster + Interest form coupons */}
			<div className="mx-auto flex w-full max-w-[1260px] flex-col items-center justify-between gap-14 px-6 py-14 sm:px-10 sm:py-20 lg:flex-row lg:items-center lg:gap-12 lg:py-24">
				{/* Left: What is IrvineHacks? taped poster */}
				<div className="relative w-full max-w-[563px]">
					{/* Top-left green flares */}
					<Image
						src={flare1}
						alt=""
						aria-hidden="true"
						className="pointer-events-none absolute -left-8 top-4 hidden h-7 w-14 -rotate-[5.55deg] -scale-y-100 sm:block"
					/>
					<Image
						src={flare2}
						alt=""
						aria-hidden="true"
						className="pointer-events-none absolute -left-4 -top-6 hidden h-7 w-14 rotate-[56.72deg] sm:block"
					/>

					<div className="relative -rotate-[2.5deg] bg-coupon-bg px-7 py-8 shadow-[0px_11.65px_12.49px_rgba(60,40,10,0.18)] sm:-rotate-[4.07deg] sm:px-9 sm:py-11">
						{/* Corner masking tape */}
						<div
							aria-hidden="true"
							className="absolute -left-5 -top-3 h-[20px] w-[62px] -rotate-[42.24deg] bg-ih-yellow/85 sm:h-[23px] sm:w-[70px]"
						/>
						<div
							aria-hidden="true"
							className="absolute -right-5 -top-3 h-[20px] w-[62px] rotate-[42.25deg] bg-ih-yellow/85 sm:h-[23px] sm:w-[70px]"
						/>
						<div
							aria-hidden="true"
							className="absolute -bottom-3 -left-5 h-[20px] w-[62px] rotate-[42.25deg] bg-ih-yellow/85 sm:h-[23px] sm:w-[70px]"
						/>
						<div
							aria-hidden="true"
							className="absolute -bottom-3 -right-5 h-[20px] w-[62px] -rotate-[42.25deg] bg-ih-yellow/85 sm:h-[23px] sm:w-[70px]"
						/>

						<div className="flex flex-col gap-4 text-black">
							<h2 className="m-0 font-londrina text-[32px] font-normal leading-tight sm:text-[40px]">
								What is Irvinehacks?
							</h2>
							<p className="m-0 font-nunito text-[15px] font-normal leading-relaxed sm:text-[16.65px]">
								IrvineHacks is the largest collegiate hackathon in Orange
								County, and we continue expanding and improving our event every
								year. Our focus? - Enhance the community around us by giving
								students the platform to unleash their creativity in an
								environment of forward thinking individuals.
							</p>
							<p className="m-0 font-nunito text-[15px] font-normal leading-relaxed sm:text-[16.65px]">
								This year, IrvineHacks will take place the weekend of February
								12th to 14th. The event will be 100% in-person during the day
								(not overnight). Free workshops, socials, food, and swag will be
								provided!
							</p>
						</div>
					</div>
				</div>

				{/* Right: Confirm your interest + Coupon buttons */}
				<div className="relative flex flex-col items-center lg:items-start">
					{/* Handwritten prompt + arrow */}
					<div className="mb-3 flex items-center gap-2 self-start sm:ml-2">
						<p className="m-0 rotate-[2.45deg] font-handwritten text-[22px] leading-normal text-black sm:text-[24px]">
							Confirm your interest!!
						</p>
						<Image
							src={arrowLine}
							alt=""
							aria-hidden="true"
							className="h-10 w-24 translate-y-2 -rotate-[70.99deg] object-contain sm:h-12 sm:w-28"
						/>
					</div>

					{/* Coupon stack */}
					<div className="flex flex-col gap-5 sm:gap-6">
						{COUPONS.map((coupon) => (
							<a
								key={coupon.role}
								href={INTEREST_FORM_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${coupon.role} Interest Form (opens in new tab)`}
								className="group flex items-stretch transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-[0.98]"
							>
								{/* Main coupon card */}
								<div className="flex h-[94px] w-[260px] items-stretch rounded-[8.5px] border-[5px] border-coupon-bg bg-coupon-bg drop-shadow-[0px_8.5px_9.9px_rgba(0,0,0,0.12)] sm:h-[104px] sm:w-[303px] sm:border-[5.6px]">
									<div
										className={`relative flex h-full w-[210px] shrink-0 flex-col justify-center overflow-hidden px-5 py-3 sm:w-[244px] sm:px-[22px] ${coupon.bgClass}`}
									>
										<span className="font-storefront text-[40px] leading-none text-white sm:text-[48px] sm:leading-[48px]">
											{coupon.role}
										</span>
										<span className="mt-1 font-nunito text-[14px] font-normal text-coupon-bg/90 sm:text-[16px]">
											Interest Form
										</span>
										<Image
											src={coupon.illustration}
											alt=""
											aria-hidden="true"
											className={`pointer-events-none absolute object-contain ${coupon.illustrationClass}`}
										/>
									</div>

									<div className="flex flex-1 items-center justify-center">
										<span
											className={`inline-block rotate-90 whitespace-nowrap font-chakra text-[10px] font-bold sm:text-[11px] ${coupon.textAccentClass}`}
										>
											IrvineHacks 2027
										</span>
									</div>
								</div>

								{/* Coupon right stub */}
								<div className="relative flex h-[94px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-[6.7px] border border-coupon-bg bg-coupon-bg drop-shadow-[0px_8.5px_9.9px_rgba(0,0,0,0.12)] sm:h-[104px] sm:w-[62px]">
									{/* Notch cutout on left edge */}
									<div
										aria-hidden="true"
										className="absolute -left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-cream"
									/>
									<div className="flex items-center gap-1.5">
										<Image
											src={coupon.barcode}
											alt=""
											aria-hidden="true"
											className="h-[68px] w-[20px] sm:h-[78px] sm:w-[22px]"
										/>
										<span
											className={`inline-block -rotate-90 whitespace-nowrap font-nunito text-[6.5px] font-light sm:text-[7px] ${coupon.expColorClass}`}
										>
											exp never - 1 per hack
										</span>
									</div>
								</div>
							</a>
						))}
					</div>

					{/* Bottom-right green flares */}
					<Image
						src={flare3}
						alt=""
						aria-hidden="true"
						className="pointer-events-none absolute -bottom-7 -right-8 hidden h-6 w-11 -rotate-[132.82deg] sm:block"
					/>
					<Image
						src={flare4}
						alt=""
						aria-hidden="true"
						className="pointer-events-none absolute -bottom-3 -right-11 hidden h-6 w-11 rotate-[164.91deg] -scale-y-100 sm:block"
					/>
				</div>
			</div>

			{/* Bottom colored stripes & wall */}
			<div aria-hidden="true" className="w-full">
				<div className="h-[16px] w-full bg-stripe-blue lg:h-[26px]" />
				<div className="mt-1.5 h-[11px] w-full bg-stripe-green lg:mt-[9px] lg:h-[18px]" />
				<div className="mt-3.5 h-[48px] w-full bg-wall-line sm:mt-5 sm:h-[68px] lg:mt-[23px] lg:h-[86px]" />
			</div>
		</section>
	);
}
