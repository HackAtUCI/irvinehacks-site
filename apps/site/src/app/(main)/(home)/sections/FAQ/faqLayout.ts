import { StaticImageData } from "next/image";

import banana from "@/assets/coming-soon/banana.svg";
import ramune from "@/assets/coming-soon/ramune.svg";
import sodaCan from "@/assets/coming-soon/soda-can.svg";

import chipsGreen from "./assets/chips-green.svg";
import chipsRed from "./assets/chips-red.svg";
import chipsYellow from "./assets/chips-yellow.svg";
import type { FAQCategory } from "./FAQ";

/* Shared by the FAQ server markup and its client pieces. */

export const FAQ_CATEGORIES = [
	{ id: "general", label: "General" },
	{ id: "logistics", label: "Logistics" },
	{ id: "registration", label: "Registration" },
	{ id: "other", label: "Other" },
] as const;

export const DEFAULT_FAQ_CATEGORY: FAQCategory = "general";

export function getCategoryLabel(category: FAQCategory) {
	return (
		FAQ_CATEGORIES.find(({ id }) => id === category)?.label ??
		FAQ_CATEGORIES[0].label
	);
}

/** number of slips that fit in the basket at once */
export const SLIPS_PER_PAGE = 6;

/** conveyor belt slide between the basket and the receipt */
export const SLIDE_MS = 900;
export const SLIDE_EASING = /**"cubic-bezier(0.65, 0, 0.35, 1)"*/ "linear";

/**
 * The FAQ scene is drawn in "design units" (1 unit = 1px of the Figma frame)
 * and scaled with container query units, so every piece of the illustration
 * keeps its exact proportions at any viewport width without JS measuring.
 *
 * `makeUnit(base)` converts design units into `cqw` relative to a stage that
 * is `base` units wide (1440 for desktop, 420 for mobile).
 */
export type Unit = (px: number) => string;

export function makeUnit(base: number, scale = 1): Unit {
	return (px) => `${+((px * scale * 100) / base).toFixed(4)}cqw`;
}

export interface PlacedItem {
	src: StaticImageData;
	/** center of the item, in track coordinates */
	cx: number;
	cy: number;
	width: number;
	height: number;
	rotate: number;
	flipY?: boolean;
}

export interface SlipSlot {
	/** center of the slip, in track coordinates */
	cx: number;
	cy: number;
	rotate: number;
	skew: number;
}

export interface FAQLayout {
	name: "desktop" | "mobile";
	/** width of the stage in design units */
	base: number;
	/** maximum rendered width of the stage, in px */
	maxWidth: number;
	stageHeight: number;
	header: {
		paper: { left: number; top: number; width: number; height: number };
		/** y position where the header paper disappears into the register slot */
		paperClipY: number;
		title: { cx: number; top: number; fontSize: number; tracking: number };
		redLine: {
			cx: number;
			cy: number;
			width: number;
			height: number;
			rotate: number;
		};
		slotLine: { left: number; top: number; width: number; height: number };
		tag: { cx: number; cy: number; scale: number };
	};
	register: {
		left: number;
		top: number;
		width: number;
		topBlock: { left: number; width: number; height: number };
		bodyHeight: number;
		frame: { left: number; width: number; top: number; height: number };
		screen: { left: number; width: number; top: number; height: number };
		radius: number;
		innerRadius: number;
		buttonFontSize: number;
		/** "row" renders the 4 keys in one line, "grid" in a 2x2 grid */
		keys: "row" | "grid";
	};
	belt: { top: number; height: number; rail: number };
	track: {
		/** track origin, in stage coordinates */
		left: number;
		top: number;
		/** how far the conveyor travels to reveal the receipt */
		shift: number;
	};
	basket: {
		cx: number;
		cy: number;
		width: number;
		height: number;
		rotate: number;
	};
	groceries: PlacedItem[];
	slots: SlipSlot[];
	slipScale: number;
	divider: { cx: number; cy: number; width: number; height: number };
	receipt: { left: number; top: number; scale: number };
	sideItems: PlacedItem[];
	moreButton: { cx: number; cy: number; rotate: number; scale: number };
	/** disable the basket slips while the receipt is showing (they're off-screen) */
	inertBasketWhenOpen: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  Desktop                                   */
/* -------------------------------------------------------------------------- */

// Values below are taken 1:1 from the Figma "FAQs" (815:809) and
// "FAQ Selected" (672:1546) frames. The track origin is the Figma
// "Conveyer Belt Items" frame.
const DESKTOP_GROCERIES: PlacedItem[] = [
	{
		src: ramune,
		cx: 565.4,
		cy: 175.6,
		width: 91.1,
		height: 256.4,
		rotate: -2.19,
	},
	{
		src: banana,
		cx: 235.25,
		cy: 278.3,
		width: 187.5,
		height: 141.5,
		rotate: 0,
	},
	{
		src: chipsRed,
		cx: 683.26,
		cy: 232.1,
		width: 168.3,
		height: 188.4,
		rotate: 15.51,
	},
	{
		src: chipsGreen,
		cx: 507.1,
		cy: 468.2,
		width: 182.9,
		height: 207.4,
		rotate: -8.72,
		flipY: true,
	},
	{
		src: sodaCan,
		cx: 300,
		cy: 369.4,
		width: 81.8,
		height: 137,
		rotate: 7.88,
	},
];

const DESKTOP_BASKET = {
	cx: 484.35,
	cy: 335.23,
	width: 975,
	height: 635,
	rotate: 0,
};

export const DESKTOP_LAYOUT: FAQLayout = {
	name: "desktop",
	base: 1440,
	maxWidth: 1440,
	stageHeight: 1213,
	header: {
		paper: { left: 525.5, top: 25.8, width: 432, height: 130.8 },
		paperClipY: 145,
		title: { cx: 736.5, top: 64, fontSize: 56, tracking: 2.8 },
		redLine: { cx: 742.5, cy: 56.2, width: 381.2, height: 7.4, rotate: 2.27 },
		slotLine: { left: 516, top: 137, width: 444, height: 12 },
		tag: { cx: 1041.36, cy: 172.07, scale: 1 },
	},
	register: {
		left: 308,
		top: 93,
		width: 835,
		topBlock: { left: 69.1, width: 690.2, height: 70.4 },
		bodyHeight: 171.6,
		frame: { left: 69.1, width: 690.2, top: 88.7, height: 127.3 },
		screen: { left: 85, width: 660.5, top: 103.5, height: 98.5 },
		radius: 11,
		innerRadius: 5.4,
		buttonFontSize: 24,
		keys: "row",
	},
	belt: { top: 366, height: 772, rail: 32 },
	track: { left: 234, top: 415.39, shift: 624 },
	basket: DESKTOP_BASKET,
	groceries: DESKTOP_GROCERIES,
	slots: [
		// the four slips from the design...
		{ cx: 315.68, cy: 193.6, rotate: -2.55, skew: 0 },
		{ cx: 576.4, cy: 281.5, rotate: 4.44, skew: 1.57 },
		{ cx: 607.86, cy: 399.7, rotate: 10.21, skew: 1.57 },
		{ cx: 335.96, cy: 419.2, rotate: -4.02, skew: 0.53 },
		// ...plus two extra spots for categories with more questions
		{ cx: 735, cy: 150, rotate: 6.5, skew: 0 },
		{ cx: 470, cy: 532, rotate: -2.5, skew: 0.5 },
	],
	slipScale: 1,
	divider: { cx: 1053.75, cy: 335.2, width: 56, height: 678 },
	receipt: { left: 1138.79, top: 14.77, scale: 1 },
	sideItems: [
		{
			src: ramune,
			cx: 1673.7,
			cy: 338.3,
			width: 109.4,
			height: 308,
			rotate: 2,
		},
		{
			src: chipsYellow,
			cx: 1735.5,
			cy: 502.3,
			width: 193,
			height: 241,
			rotate: 0,
		},
	],
	moreButton: { cx: 838, cy: 618, rotate: -4, scale: 1 },
	inertBasketWhenOpen: false,
};

/* -------------------------------------------------------------------------- */
/*                                   Mobile                                   */
/* -------------------------------------------------------------------------- */

// There is no mobile frame in Figma, so the mobile scene re-uses the desktop
// pieces: the basket is turned 90deg to fit a portrait screen (groceries are
// rotated with it so the arrangement stays identical), the slips are stacked
// vertically and the register keys wrap into a 2x2 grid.
const MOBILE_BASKET_SCALE = 0.62;
const MOBILE_BASKET_CENTER = { cx: 210, cy: 340 };

function rotateIntoMobileBasket(item: PlacedItem): PlacedItem {
	const dx = item.cx - DESKTOP_BASKET.cx;
	const dy = item.cy - DESKTOP_BASKET.cy;
	return {
		...item,
		cx: MOBILE_BASKET_CENTER.cx - dy * MOBILE_BASKET_SCALE,
		cy: MOBILE_BASKET_CENTER.cy + dx * MOBILE_BASKET_SCALE,
		width: item.width * MOBILE_BASKET_SCALE,
		height: item.height * MOBILE_BASKET_SCALE,
		rotate: item.rotate + 90,
	};
}

const MOBILE_HEADER_SCALE = 0.62;
const MOBILE_PAPER_TOP = 6;

export const MOBILE_LAYOUT: FAQLayout = {
	name: "mobile",
	base: 420,
	maxWidth: 520,
	stageHeight: 1090,
	header: {
		paper: {
			left: 210 - (432 * MOBILE_HEADER_SCALE) / 2,
			top: MOBILE_PAPER_TOP,
			width: 432 * MOBILE_HEADER_SCALE,
			height: 130.8 * MOBILE_HEADER_SCALE,
		},
		paperClipY: MOBILE_PAPER_TOP + (145 - 25.8) * MOBILE_HEADER_SCALE,
		title: {
			cx: 207,
			top: MOBILE_PAPER_TOP + (64 - 25.8) * MOBILE_HEADER_SCALE - 1,
			fontSize: 36,
			tracking: 1.8,
		},
		redLine: {
			cx: 210.6,
			cy: MOBILE_PAPER_TOP + (56.2 - 25.8) * MOBILE_HEADER_SCALE,
			width: 381.2 * MOBILE_HEADER_SCALE,
			height: 7.4 * MOBILE_HEADER_SCALE,
			rotate: 2.27,
		},
		slotLine: {
			left: 210 - (444 * MOBILE_HEADER_SCALE) / 2,
			top: MOBILE_PAPER_TOP + (137 - 25.8) * MOBILE_HEADER_SCALE,
			width: 444 * MOBILE_HEADER_SCALE,
			height: 12 * MOBILE_HEADER_SCALE,
		},
		tag: { cx: 368, cy: 104, scale: 0.66 },
	},
	register: {
		left: 10,
		top: MOBILE_PAPER_TOP + (93 - 25.8) * MOBILE_HEADER_SCALE,
		width: 400,
		topBlock: { left: 40, width: 320, height: 34 },
		bodyHeight: 214,
		frame: { left: 22, width: 356, top: 48, height: 186 },
		screen: { left: 30, width: 340, top: 56, height: 170 },
		radius: 11,
		innerRadius: 5.4,
		buttonFontSize: 20,
		keys: "grid",
	},
	belt: { top: 330, height: 720, rail: 20 },
	track: { left: 0, top: 360, shift: 467.4 },
	basket: {
		...MOBILE_BASKET_CENTER,
		width: DESKTOP_BASKET.width * MOBILE_BASKET_SCALE,
		height: DESKTOP_BASKET.height * MOBILE_BASKET_SCALE,
		rotate: 90,
	},
	groceries: DESKTOP_GROCERIES.map(rotateIntoMobileBasket),
	slots: [
		{ cx: 205, cy: 130, rotate: -3, skew: 0 },
		{ cx: 215, cy: 225, rotate: 3, skew: 1 },
		{ cx: 205, cy: 320, rotate: -2, skew: 0.5 },
		{ cx: 215, cy: 415, rotate: 4, skew: 1 },
		{ cx: 205, cy: 505, rotate: -3, skew: 0 },
		{ cx: 212, cy: 592, rotate: 2, skew: 0.5 },
	],
	slipScale: 0.78,
	divider: { cx: 450, cy: 340, width: 49.6, height: 600 },
	receipt: { left: 490, top: 70, scale: 0.8 },
	sideItems: [
		{
			src: ramune,
			cx: 830,
			cy: 520,
			width: 60.4,
			height: 170,
			rotate: 2,
		},
		{
			src: chipsYellow,
			cx: 780,
			cy: 612,
			width: 100,
			height: 124.9,
			rotate: -4,
		},
	],
	moreButton: { cx: 210, cy: 656, rotate: -2, scale: 0.8 },
	inertBasketWhenOpen: true,
};

export type LayoutName = FAQLayout["name"];

export const FAQ_LAYOUTS: Record<LayoutName, FAQLayout> = {
	desktop: DESKTOP_LAYOUT,
	mobile: MOBILE_LAYOUT,
};

/** element ids, one set per rendered layout */
export function getFAQIds(name: LayoutName) {
	return {
		heading: `faq-heading-${name}`,
		basket: `faq-basket-${name}`,
		receipt: `faq-answer-${name}`,
	};
}
