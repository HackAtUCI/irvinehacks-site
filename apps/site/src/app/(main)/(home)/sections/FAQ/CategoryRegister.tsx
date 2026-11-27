"use client";

import { useMemo } from "react";

import { useFAQ } from "./FAQProvider";
import {
	FAQ_CATEGORIES,
	FAQLayout,
	LayoutName,
	FAQ_LAYOUTS,
	getFAQIds,
	makeUnit,
	Unit,
} from "./faqLayout";
import type { FAQCategory } from "./FAQ";

interface CategoryRegisterProps {
	register: FAQLayout["register"];
	u: Unit;
	category: FAQCategory;
	onCategoryChange: (category: FAQCategory) => void;
	controlsId: string;
}

/**
 * Cash register / card reader with the category keys (Figma: "Card Reader" +
 * "nav bar"). Drawn with CSS instead of the exported SVG so the keys can sit
 * on its screen and the whole register can be reflowed for mobile.
 */
function RegisterView({
	register,
	u,
	category,
	onCategoryChange,
	controlsId,
}: CategoryRegisterProps) {
	const { topBlock, frame, screen } = register;

	return (
		<div
			className="absolute"
			style={{
				left: u(register.left),
				top: u(register.top),
				width: u(register.width),
				height: u(topBlock.height + register.bodyHeight),
			}}
		>
			{/* register housing */}
			<div
				aria-hidden="true"
				className="absolute inset-0"
				style={{
					filter: `drop-shadow(0 ${u(4.5)} ${u(4.4)} rgba(0, 0, 0, 0.2))`,
				}}
			>
				<div
					className="absolute top-0 bg-[#434343]"
					style={{
						left: u(topBlock.left),
						width: u(topBlock.width),
						height: u(topBlock.height + register.radius),
						borderTopLeftRadius: u(register.innerRadius),
						borderTopRightRadius: u(register.innerRadius),
					}}
				/>
				<div
					className="absolute inset-x-0 bottom-0 bg-[#434343]"
					style={{
						height: u(register.bodyHeight),
						borderRadius: u(register.radius),
					}}
				/>
			</div>
			<div
				aria-hidden="true"
				className="absolute bg-[#616161]"
				style={{
					left: u(frame.left),
					top: u(frame.top),
					width: u(frame.width),
					height: u(frame.height),
					borderRadius: u(register.innerRadius),
				}}
			/>

			{/* screen with the category keys */}
			<div
				className="absolute flex items-center justify-center bg-gradient-to-b from-[#cecece] to-[#b8b8b8]"
				style={{
					left: u(screen.left),
					top: u(screen.top),
					width: u(screen.width),
					height: u(screen.height),
					borderRadius: u(register.innerRadius),
				}}
			>
				<div
					role="group"
					aria-label="FAQ categories"
					className={
						register.keys === "row"
							? "flex items-center justify-center"
							: "grid w-full grid-cols-2"
					}
					style={{
						gap: u(register.keys === "row" ? 20 : 12),
						padding: register.keys === "row" ? undefined : `0 ${u(14)}`,
					}}
				>
					{FAQ_CATEGORIES.map(({ id, label }) => {
						const selected = id === category;
						return (
							<button
								key={id}
								type="button"
								aria-pressed={selected}
								aria-controls={controlsId}
								onClick={() => onCategoryChange(id)}
								className={`whitespace-nowrap bg-white text-center font-geo leading-normal text-black transition-[transform,filter] duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ih-blue active:translate-y-[2px] ${
									selected
										? "underline decoration-from-font [text-underline-position:from-font]"
										: ""
								}`}
								style={{
									padding: `${u(10)} ${u(20)}`,
									fontSize: u(register.buttonFontSize),
									borderRadius: u(12),
									// selected key: blue outline + blue glow (Figma / UI notes)
									boxShadow: selected
										? `inset 0 0 0 ${u(3)} var(--color-ih-blue)`
										: undefined,
									filter: selected
										? `drop-shadow(0 ${u(2)} ${u(5)} #aad0fc)`
										: `drop-shadow(0 ${u(4)} ${u(2)} rgba(0, 0, 0, 0.25))`,
								}}
							>
								{label}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default function CategoryRegister({
	layoutName,
}: {
	layoutName: LayoutName;
}) {
	const layout = FAQ_LAYOUTS[layoutName];
	const u = useMemo(() => makeUnit(layout.base), [layout.base]);
	const { category, changeCategory } = useFAQ();

	return (
		<RegisterView
			register={layout.register}
			u={u}
			category={category}
			onCategoryChange={changeCategory}
			controlsId={getFAQIds(layoutName).basket}
		/>
	);
}
