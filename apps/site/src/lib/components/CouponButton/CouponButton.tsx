import Image, { StaticImageData } from "next/image";
import Link from "next/link";

export interface CouponButtonProps {
	title: string;
	subtitle: string;
	/** When omitted, the coupon renders as a non-interactive <div role="group"> */
	href?: string;
	external?: boolean;
	/** Background color behind the title/subtitle panel (e.g. "bg-coral", "bg-ih-blue") */
	panelBgClass: string;
	/** Color of the vertical label next to the panel (e.g. "text-coral") */
	accentTextClass: string;
	/** Background color of the right/side barcode stub tab (defaults to "bg-coupon-bg") */
	stubBgClass?: string;
	/** Color of the "exp never - 1 per hack" text */
	expColorClass: string;
	/** Background color of the semi-circle notch cutout (should match the page section behind the coupon, defaults to "bg-cream") */
	notchBgClass?: string;
	illustration: StaticImageData;
	illustrationClass: string;
	barcode: StaticImageData;
	stubLabel?: string;
	expText?: string;
	ariaLabel?: string;
}

export default function CouponButton({
	title,
	subtitle,
	href,
	external = false,
	panelBgClass,
	accentTextClass,
	stubBgClass = "bg-coupon-bg",
	expColorClass,
	notchBgClass = "bg-cream",
	illustration,
	illustrationClass,
	barcode,
	stubLabel = "IrvineHacks 2027",
	expText = "exp never - 1 per hack",
	ariaLabel,
}: CouponButtonProps) {
	const wrapperClassName =
		"group flex items-center drop-shadow-[0px_8px_5px_rgba(0,0,0,0.22)] transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-[0.98]";

	const content = (
		<>
			{/* Main coupon card (white frame with customizable inner panel color) */}
			<div className="flex h-[94px] w-[264px] items-stretch rounded-[8.5px] border-[5px] border-coupon-bg bg-coupon-bg sm:h-[104px] sm:w-[303px] sm:border-[5.6px]">
				<div
					className={`relative flex h-full w-[206px] shrink-0 flex-col justify-center overflow-hidden px-5 py-3 sm:w-[244px] sm:px-[22px] ${panelBgClass}`}
				>
					<span className="font-storefront text-[40px] leading-none text-white sm:text-[48px] sm:leading-[44px]">
						{title}
					</span>
					<span className="font-nunito text-[14px] font-normal leading-tight text-[#f8f7f3]/90 sm:text-[16px]">
						{subtitle}
					</span>
					<Image
						src={illustration}
						alt=""
						aria-hidden="true"
						className={`pointer-events-none absolute object-contain ${illustrationClass}`}
					/>
				</div>

				<div className="flex w-[48px] shrink-0 items-center justify-center">
					<span
						className={`inline-block rotate-90 whitespace-nowrap font-chakra text-[10px] font-bold leading-none sm:text-[11px] ${accentTextClass}`}
					>
						{stubLabel}
					</span>
				</div>
			</div>

			{/* Coupon right/side stub tab (customizable background) */}
			<div
				className={`relative -ml-[1px] flex h-[96px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[6.7px] sm:h-[107px] sm:w-[62px] ${stubBgClass}`}
			>
				<div
					aria-hidden="true"
					className={`absolute -left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full ${notchBgClass}`}
				/>
				<div className="flex items-center justify-center gap-1 pl-1">
					<div className="flex h-[68px] w-[20px] items-center justify-center sm:h-[78px] sm:w-[22px]">
						<Image
							src={barcode}
							alt=""
							aria-hidden="true"
							className="h-[20px] w-[68px] max-w-none rotate-90 sm:h-[22px] sm:w-[78px]"
						/>
					</div>
					<div className="flex h-[68px] w-[9px] items-center justify-center sm:h-[76px]">
						<span
							className={`inline-block -rotate-90 whitespace-nowrap font-nunito text-[6.5px] font-light leading-none sm:text-[6.87px] ${expColorClass}`}
						>
							{expText}
						</span>
					</div>
				</div>
			</div>
		</>
	);

	const computedAriaLabel =
		ariaLabel ??
		`${title} ${subtitle}${href && external ? " (opens in new tab)" : ""}`;

	if (!href) {
		return (
			<div
				role="group"
				aria-label={computedAriaLabel}
				className={wrapperClassName}
			>
				{content}
			</div>
		);
	}

	if (external) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={computedAriaLabel}
				className={wrapperClassName}
			>
				{content}
			</a>
		);
	}

	return (
		<Link
			href={href}
			aria-label={computedAriaLabel}
			className={wrapperClassName}
		>
			{content}
		</Link>
	);
}
