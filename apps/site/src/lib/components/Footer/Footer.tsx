import Image from "next/image";

import ihLogoMask from "@/assets/coming-soon/ih-logo-mask.png";
import barcodeNav from "@/assets/coming-soon/barcode-nav.svg";

const Footer = () => {
	return (
		<footer className="flex min-h-[90px] w-full flex-wrap items-center justify-between gap-4 bg-coral px-6 py-3.5 sm:px-8">
			<div className="flex flex-col items-start justify-between gap-1">
				<div className="flex items-center gap-2.5">
					<div
						aria-hidden="true"
						className="h-6 w-6 shrink-0 bg-black"
						style={{
							WebkitMaskImage: `url(${ihLogoMask.src})`,
							maskImage: `url(${ihLogoMask.src})`,
							WebkitMaskRepeat: "no-repeat",
							maskRepeat: "no-repeat",
							WebkitMaskSize: "contain",
							maskSize: "contain",
							WebkitMaskPosition: "center",
							maskPosition: "center",
						}}
					/>
					<p className="m-0 font-inter text-[18px] font-semibold leading-normal text-black sm:text-[20px]">
						Hack at UCI
					</p>
					<span className="inline-block rotate-[10.1deg] font-inter text-[13px] font-semibold leading-none text-black drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)] sm:text-[14px]">
						2027!
					</span>
				</div>
				<p className="m-0 font-geo text-[16px] leading-normal text-black sm:text-[18px]">
					Produced and packaged in Irvine, CA
				</p>
			</div>

			<div className="relative flex h-[56px] w-[62px] shrink-0 items-end">
				<Image
					src={barcodeNav}
					alt="IrvineHacks 2027 barcode"
					className="h-[39px] w-[52px]"
				/>
				<span className="absolute right-0 top-0 rotate-[10.1deg] font-inter text-[14px] font-semibold leading-none text-black drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]">
					2027!
				</span>
			</div>
		</footer>
	);
};

export default Footer;
