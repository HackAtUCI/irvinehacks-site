"use client";

import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";

import ih27Logo from "@/assets/coming-soon/ih27-logo.svg";
import navButtonBg from "@/assets/coming-soon/nav-button-bg.svg";
import barcodeNav from "@/assets/coming-soon/barcode-nav.svg";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function BaseNavbar(_props: PropsWithChildren) {
	const handleInterestFormClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (window.location.pathname === "/") {
			e.preventDefault();
			const target = document.getElementById("interest-forms");
			if (target) {
				target.scrollIntoView({ behavior: "smooth" });
			}
		}
	};

	return (
		<header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-4 pt-4 sm:px-10 sm:pt-8 lg:px-14 lg:pt-10">
			<Link
				href="/"
				aria-label="IrvineHacks 2027 Home"
				className="pointer-events-auto transition-transform duration-200 hover:scale-105"
			>
				<Image
					src={ih27Logo}
					alt="IrvineHacks 2027 Logo"
					className="h-auto w-[68px] sm:w-[88px] lg:w-[100px]"
					priority
				/>
			</Link>

			<nav
				aria-label="Primary navigation"
				className="pointer-events-auto flex h-[68px] items-center rounded-[12px] border-[4px] border-white bg-coral px-2.5 drop-shadow-[0px_10px_5px_rgba(0,0,0,0.25)] sm:h-[82px] sm:border-[5px] sm:px-3 lg:h-[88px]"
			>
				<div className="flex items-center gap-4 sm:gap-10 lg:gap-[75px]">
					<a
						href="/#interest-forms"
						onClick={handleInterestFormClick}
						className="relative inline-flex h-[46px] w-[114px] items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 sm:h-[55px] sm:w-[137px]"
					>
						<Image
							src={navButtonBg}
							alt=""
							aria-hidden="true"
							className="pointer-events-none absolute inset-0 h-full w-full object-contain"
						/>
						<span className="relative z-10 flex h-[31px] w-[82px] -rotate-[3.51deg] skew-x-[1.76deg] items-center justify-center rounded-[10px] bg-white sm:h-[37px] sm:w-[98px]">
							<span className="flex flex-col text-center font-geo text-[15px] leading-[13px] text-black sm:text-[18px] sm:leading-[16px]">
								<span>interest</span>
								<span>form</span>
							</span>
						</span>
					</a>

					<div className="relative flex h-[48px] w-[54px] shrink-0 items-end sm:h-[56px] sm:w-[62px]">
						<Image
							src={barcodeNav}
							alt="IrvineHacks 2027 barcode"
							className="h-[34px] w-[46px] sm:h-[39px] sm:w-[52px]"
						/>
						<span className="absolute right-0 top-0 rotate-[10.1deg] font-inter text-[12px] font-semibold leading-none text-black drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)] sm:text-[14px]">
							2027!
						</span>
					</div>
				</div>
			</nav>
		</header>
	);
}
