import Image, { StaticImageData } from "next/image";

import sodaCan from "@/assets/coming-soon/soda-can.svg";
import banana from "@/assets/coming-soon/banana.svg";
import ramune from "@/assets/coming-soon/ramune.svg";
import barcodeHacker from "@/assets/coming-soon/barcode-hacker.svg";
import barcodeJudge from "@/assets/coming-soon/barcode-judge.svg";
import barcodeMentor from "@/assets/coming-soon/barcode-mentor.svg";
import arrowLine from "@/assets/coming-soon/arrow-line.svg";
import flaresTopLeft from "@/assets/coming-soon/flares-top-left.svg";
import flaresBottomRight from "@/assets/coming-soon/flares-bottom-right.svg";

interface CouponConfig {
	role: string;
	bgClass: string;
	textAccentClass: string;
	expColorClass: string;
	illustration: StaticImageData;
	illustrationClass: string;
	barcode: StaticImageData;
	interestForm: string;
}

const COUPONS: CouponConfig[] = [
	{
		role: "Hacker",
		bgClass: "bg-coral",
		textAccentClass: "text-coral",
		expColorClass: "text-[#ff7830]",
		illustration: sodaCan,
		illustrationClass:
			"right-3 top-6 h-[64px] w-[40px] rotate-[11.64deg] sm:right-4 sm:top-8 sm:h-[67px] sm:w-[40px]",
		barcode: barcodeHacker,
		interestForm: "https://forms.gle/Tqn91PCedcb1iqNc6",
	},
	{
		role: "Judge",
		bgClass: "bg-judge-pink",
		textAccentClass: "text-judge-pink",
		expColorClass: "text-ih-yellow",
		illustration: banana,
		illustrationClass:
			"right-2 top-[24px] h-[68px] w-[90px] rotate-[139.41deg] -scale-y-100 sm:right-1 sm:top-[36px] sm:h-[71px] sm:w-[96px]",
		barcode: barcodeJudge,
		interestForm: "https://forms.gle/1s819TcMoYUKAyyf7",
	},
	{
		role: "Mentor",
		bgClass: "bg-ih-blue",
		textAccentClass: "text-ih-blue",
		expColorClass: "text-[#25c3e6]",
		illustration: ramune,
		illustrationClass:
			"right-4 top-2 h-[96px] w-[34px] rotate-[15.4deg] sm:right-4 sm:top-3 sm:h-[105px] sm:w-[36px]",
		barcode: barcodeMentor,
		interestForm: "https://forms.gle/piQ793jmrL2m99VP6",
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
			<div className="mx-auto flex w-full max-w-[1180px] flex-col items-center justify-center gap-14 px-6 py-14 sm:px-10 sm:py-20 lg:flex-row lg:items-center lg:gap-[74px] lg:py-24">
				{/* Left: What is IrvineHacks? taped poster */}
				<div className="relative w-full max-w-[563px] shrink-0 lg:w-[563px]">
					{/* Top-left bundled green flares */}
					<Image
						src={flaresTopLeft}
						alt=""
						aria-hidden="true"
						className="pointer-events-none absolute -left-[100px] -top-[26px] hidden h-[78px] w-[71px] sm:block"
					/>

					<div className="relative -rotate-[2.5deg] bg-coupon-bg px-7 py-8 shadow-[0px_11.65px_12.49px_rgba(60,40,10,0.18)] sm:-rotate-[4.07deg] sm:px-8 sm:py-10">
						{/* Corner masking tape */}
						<div
							aria-hidden="true"
							className="absolute -left-5 -top-3 h-[20px] w-[62px] -rotate-[42.24deg] skew-x-[-4.45deg] bg-[rgba(255,204,64,0.85)] sm:h-[23px] sm:w-[70px]"
						/>
						<div
							aria-hidden="true"
							className="absolute -right-5 -top-3 h-[20px] w-[62px] rotate-[42.25deg] skew-x-[4.46deg] bg-[rgba(255,204,64,0.85)] sm:h-[23px] sm:w-[70px]"
						/>
						<div
							aria-hidden="true"
							className="absolute -bottom-3 -left-5 h-[20px] w-[62px] rotate-[42.25deg] skew-x-[4.46deg] bg-[rgba(255,204,64,0.85)] sm:h-[23px] sm:w-[70px]"
						/>
						<div
							aria-hidden="true"
							className="absolute -bottom-3 -right-5 h-[20px] w-[62px] -rotate-[42.25deg] skew-x-[-4.46deg] bg-[rgba(255,204,64,0.85)] sm:h-[23px] sm:w-[70px]"
						/>

						<div className="flex flex-col gap-3.5 text-black">
							<h2 className="m-0 font-londrina text-[32px] font-normal leading-tight sm:text-[40px]">
								What is IrvineHacks?
							</h2>
							<p className="m-0 font-nunito text-[15px] font-normal leading-[1.35] sm:text-[16.65px]">
								IrvineHacks is the largest collegiate hackathon in Orange
								County, and we continue expanding and improving our event every
								year. Our focus? - Enhance the community around us by giving
								students the platform to unleash their creativity in an
								environment of forward thinking individuals.
							</p>
							<p className="m-0 font-nunito text-[15px] font-normal leading-[1.35] sm:text-[16.65px]">
								This year, IrvineHacks will take place the weekend of February
								12th to 14th. The event will be 100% in-person during the day
								(not overnight). Free workshops, socials, food, and swag will be
								provided!
							</p>
						</div>
					</div>
				</div>

				{/* Right: Confirm your interest + Coupon buttons */}
				<div className="relative flex shrink-0 flex-col items-center lg:items-start">
					{/* Handwritten prompt + arrow */}
					<div className="relative mb-3 flex items-center self-start sm:-ml-2">
						<p className="m-0 rotate-[2.45deg] font-handwritten text-[22px] leading-normal text-black sm:text-[24px]">
							Confirm your interest!!
						</p>
						<div
							aria-hidden="true"
							className="pointer-events-none flex h-[60px] w-[105px] translate-x-[4px] translate-y-[8px] items-center justify-center sm:h-[73px] sm:w-[125px]"
						>
							<Image
								src={arrowLine}
								alt=""
								className="h-[100px] w-[30px] -rotate-[70.99deg] sm:h-[120px] sm:w-[35px]"
							/>
						</div>
					</div>

					{/* Coupon stack */}
					<div className="flex flex-col gap-5 sm:gap-6">
						{COUPONS.map((coupon) => (
							<a
								key={coupon.role}
								href={coupon.interestForm}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${coupon.role} Interest Form (opens in new tab)`}
								className="group flex items-center drop-shadow-[0px_8px_5px_rgba(0,0,0,0.22)] transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-[0.98]"
							>
								{/* Main coupon card */}
								<div className="flex h-[94px] w-[264px] items-stretch rounded-[8.5px] border-[5px] border-coupon-bg bg-coupon-bg sm:h-[104px] sm:w-[303px] sm:border-[5.6px]">
									<div
										className={`relative flex h-full w-[206px] shrink-0 flex-col justify-center overflow-hidden px-5 py-3 sm:w-[244px] sm:px-[22px] ${coupon.bgClass}`}
									>
										<span className="font-storefront text-[40px] leading-none text-white sm:text-[48px] sm:leading-[44px]">
											{coupon.role}
										</span>
										<span className="font-nunito text-[14px] font-normal leading-tight text-[#f8f7f3]/90 sm:text-[16px]">
											Interest Form
										</span>
										<Image
											src={coupon.illustration}
											alt=""
											aria-hidden="true"
											className={`pointer-events-none absolute object-contain ${coupon.illustrationClass}`}
										/>
									</div>

									<div className="flex w-[48px] shrink-0 items-center justify-center">
										<span
											className={`inline-block rotate-90 whitespace-nowrap font-chakra text-[10px] font-bold leading-none sm:text-[11px] ${coupon.textAccentClass}`}
										>
											IrvineHacks 2027
										</span>
									</div>
								</div>

								{/* Coupon right stub */}
								<div className="relative -ml-[1px] flex h-[96px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[6.7px] border border-coupon-bg bg-coupon-bg sm:h-[107px] sm:w-[62px]">
									{/* Notch cutout on left edge */}
									<div
										aria-hidden="true"
										className="absolute -left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-cream"
									/>
									<div className="flex items-center justify-center gap-1 pl-1">
										<div className="flex h-[68px] w-[20px] items-center justify-center sm:h-[78px] sm:w-[22px]">
											<Image
												src={coupon.barcode}
												alt=""
												aria-hidden="true"
												className="h-[20px] w-[68px] max-w-none rotate-90 sm:h-[22px] sm:w-[78px]"
											/>
										</div>
										<div className="flex h-[68px] w-[9px] items-center justify-center sm:h-[76px]">
											<span
												className={`inline-block -rotate-90 whitespace-nowrap font-nunito text-[6.5px] font-light leading-none sm:text-[6.87px] ${coupon.expColorClass}`}
											>
												exp never - 1 per hack
											</span>
										</div>
									</div>
								</div>
							</a>
						))}
					</div>

					{/* Bottom-right bundled green flares */}
					<Image
						src={flaresBottomRight}
						alt=""
						aria-hidden="true"
						className="pointer-events-none absolute -bottom-[40px] -right-[64px] hidden h-[61px] w-[57px] sm:block"
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
