import Image from "next/image";

import CouponButton, {
	CouponButtonProps,
} from "@/lib/components/CouponButton/CouponButton";

import sodaCan from "@/assets/coming-soon/soda-can.svg";
import banana from "@/assets/coming-soon/banana.svg";
import ramune from "@/assets/coming-soon/ramune.svg";
import barcodeHacker from "@/assets/coming-soon/barcode-hacker.svg";
import barcodeJudge from "@/assets/coming-soon/barcode-judge.svg";
import barcodeMentor from "@/assets/coming-soon/barcode-mentor.svg";
import arrowLine from "@/assets/coming-soon/arrow-line.svg";
import flaresTopLeft from "@/assets/coming-soon/flares-top-left.svg";
import flaresBottomRight from "@/assets/coming-soon/flares-bottom-right.svg";

const COUPONS: CouponButtonProps[] = [
	{
		title: "Hacker",
		subtitle: "Interest Form",
		href: "https://forms.gle/Tqn91PCedcb1iqNc6",
		external: true,
		panelBgClass: "bg-coral",
		accentTextClass: "text-coral",
		expColorClass: "text-[#ff7830]",
		illustration: sodaCan,
		illustrationClass:
			"right-3 top-6 h-[64px] w-[40px] rotate-[11.64deg] sm:right-4 sm:top-7 sm:h-[67px] sm:w-[40px]",
		barcode: barcodeHacker,
	},
	{
		title: "Judge",
		subtitle: "Interest Form",
		href: "https://forms.gle/1s819TcMoYUKAyyf7",
		external: true,
		panelBgClass: "bg-judge-pink",
		accentTextClass: "text-judge-pink",
		expColorClass: "text-ih-yellow",
		illustration: banana,
		illustrationClass:
			"right-2 top-[24px] h-[68px] w-[90px] rotate-[139.41deg] -scale-y-100 sm:right-3 sm:top-[28px] sm:h-[71px] sm:w-[96px]",
		barcode: barcodeJudge,
	},
	{
		title: "Mentor",
		subtitle: "Interest Form",
		href: "https://forms.gle/piQ793jmrL2m99VP6",
		external: true,
		panelBgClass: "bg-ih-blue",
		accentTextClass: "text-ih-blue",
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
			<div className="mx-auto flex w-full max-w-[1180px] flex-col items-center justify-center gap-14 px-6 py-14 sm:px-10 sm:py-20 lg:flex-row lg:items-center lg:gap-[74px] lg:py-24">
				{/* Left: What is IrvineHacks? taped poster */}
				<div className="relative w-full max-w-[563px] shrink-0 lg:w-[563px]">
					{/* Top-left bundled green flares */}
					<Image
						src={flaresTopLeft}
						alt=""
						aria-hidden="true"
						className="pointer-events-none absolute -left-[86px] -top-[22px] hidden h-[78px] w-[71px] sm:block"
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
								What is Irvinehacks?
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
							className="pointer-events-none flex h-[60px] w-[105px] items-center justify-center sm:h-[73px] sm:w-[125px]"
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
							<CouponButton key={coupon.title} {...coupon} />
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
