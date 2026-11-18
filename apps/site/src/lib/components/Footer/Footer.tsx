import Image from "next/image";

import ihLogoMask from "@/assets/coming-soon/ih-logo-mask.png";
import barcodeNav from "@/assets/coming-soon/barcode-nav.svg";
import StickerText from "@/lib/components/StickerText";

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
					<StickerText
						text="Hack at UCI"
						strokeWidth={8}
						className="font-inter text-[18px] font-semibold leading-normal drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)] sm:text-[20px]"
					/>
					<StickerText
						text="2027!"
						strokeWidth={6}
						className="rotate-[10.1deg] font-inter text-[13px] font-semibold leading-none drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)] sm:text-[14px]"
					/>
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
				<StickerText
					text="2027!"
					strokeWidth={6}
					className="absolute right-0 top-[6px] rotate-[10.1deg] font-inter text-[14px] font-semibold leading-none drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]"
				/>
			</div>
		</footer>
	);
};

export default Footer;
