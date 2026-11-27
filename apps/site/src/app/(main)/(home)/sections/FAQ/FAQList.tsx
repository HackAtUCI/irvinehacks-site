"use client";

import Image, { StaticImageData } from "next/image";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import slipLong from "./assets/slip-long.svg";
import slipMedium from "./assets/slip-medium.svg";
import slipShort1 from "./assets/slip-short-1.svg";
import slipShort2 from "./assets/slip-short-2.svg";
import { useFAQ } from "./FAQProvider";
import {
	FAQ_LAYOUTS,
	LayoutName,
	getFAQIds,
	makeUnit,
	Unit,
} from "./faqLayout";

type SlipVariant = "short" | "medium" | "long";

interface SlipPaper {
	src: StaticImageData;
	/** hand-drawn line across the top of the slip (from the Figma vectors) */
	line: { viewBox: string; d: string };
}

// Figma: "Short FAQ Question 1/2", "Medium FAQ Question", "Long FAQ Question"
const SLIP_VARIANTS: Record<
	SlipVariant,
	{ width: number; minHeight: number; papers: SlipPaper[] }
> = {
	short: {
		width: 256,
		minHeight: 88,
		papers: [
			{
				src: slipShort1,
				line: {
					viewBox: "0 0 230.7 8.1",
					d: "M1.5 2.8L35.3 6.6L210.1 3.6L229.2 1.5",
				},
			},
			{
				src: slipShort2,
				line: {
					viewBox: "0 0 243.4 4.7",
					d: "M1.5 2.2L17.4 3.2L241.9 1.5",
				},
			},
		],
	},
	medium: {
		width: 285,
		minHeight: 112,
		papers: [
			{
				src: slipMedium,
				line: {
					viewBox: "0 0 259.2 6.1",
					d: "M1.5 1.5L123.3 4.6L257.7 1.5",
				},
			},
		],
	},
	long: {
		width: 419,
		minHeight: 112,
		papers: [
			{
				src: slipLong,
				line: {
					viewBox: "0 0 385 7.1",
					d: "M1.5 1.7L185.7 5.6L383.5 1.5",
				},
			},
		],
	},
};

/** Pick a slip size that fits the question like the designs do. */
function getSlipVariant(question: string): SlipVariant {
	if (question.length <= 42) return "short";
	if (question.length <= 75) return "medium";
	return "long";
}

interface QuestionSlipProps {
	question: string;
	variant: SlipVariant;
	/** alternates between paper shapes of the same size */
	paperIndex: number;
	u: Unit;
	selected?: boolean;
	disabled?: boolean;
	onSelect?: () => void;
	controlsId?: string;
}

/** A torn paper slip in the basket holding one FAQ question. */
const QuestionSlip = forwardRef<HTMLButtonElement, QuestionSlipProps>(
	function QuestionSlip(
		{
			question,
			variant,
			paperIndex,
			u,
			selected = false,
			disabled = false,
			onSelect,
			controlsId,
		},
		ref,
	) {
		const { width, minHeight, papers } = SLIP_VARIANTS[variant];
		const paper = papers[paperIndex % papers.length];

		return (
			<button
				ref={ref}
				type="button"
				onClick={onSelect}
				disabled={disabled}
				aria-expanded={disabled ? undefined : selected}
				aria-controls={disabled ? undefined : controlsId}
				className={`group relative block text-left transition-[transform,filter] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ih-blue disabled:cursor-default ${
					selected
						? "-translate-y-1 scale-[1.04] drop-shadow-[0_8px_8px_rgba(0,0,0,0.18)]"
						: "enabled:hover:-translate-y-1 enabled:hover:scale-[1.04] enabled:hover:drop-shadow-[0_8px_8px_rgba(0,0,0,0.18)] enabled:focus-visible:-translate-y-1 enabled:focus-visible:scale-[1.04]"
				}`}
				style={{
					width: u(width),
					minHeight: u(minHeight),
					padding: `${u(22)} ${u(20)} ${u(20)}`,
				}}
			>
				<Image
					src={paper.src}
					alt=""
					aria-hidden="true"
					fill
					draggable={false}
					className="pointer-events-none select-none object-fill"
				/>
				{/* line turns red when the slip is hovered or selected */}
				<svg
					aria-hidden="true"
					viewBox={paper.line.viewBox}
					preserveAspectRatio="none"
					fill="none"
					className="absolute"
					style={{
						left: u(12),
						top: u(8),
						width: `calc(100% - ${u(24)})`,
						height: u(7),
					}}
				>
					<path
						d={paper.line.d}
						strokeWidth="3"
						strokeLinecap="round"
						className={`transition-colors duration-200 ${
							selected
								? "stroke-coral"
								: "stroke-[#bcb5ac] group-enabled:group-hover:stroke-coral group-focus-visible:stroke-coral"
						}`}
					/>
				</svg>
				<span
					className="relative block font-nunito font-normal text-black"
					style={{ fontSize: u(20), lineHeight: u(22) }}
				>
					{question}
				</span>
			</button>
		);
	},
);

// Figma: "FAQ Answer Receipt" (675:2738), 468.5 x 640.9

/**
 * The question slips in the basket. Changing category drops a new stack of
 * slips in, top to bottom; picking one sends the belt to its answer.
 */
export default function FAQList({ layoutName }: { layoutName: LayoutName }) {
	const layout = FAQ_LAYOUTS[layoutName];
	const u = useMemo(() => makeUnit(layout.base), [layout.base]);
	const slipU = useMemo(
		() => makeUnit(layout.base, layout.slipScale),
		[layout.base, layout.slipScale],
	);
	const {
		pageFaqs,
		basketKey,
		selectedKey,
		open,
		select,
		page,
		pageCount,
		nextPage,
	} = useFAQ();
	const reduceMotion = useReducedMotion();
	const ids = getFAQIds(layoutName);

	const listRef = useRef<HTMLDivElement>(null);
	const slipRefs = useRef(new Map<string, HTMLButtonElement>());
	const lastSelected = useRef<string | null>(null);

	// when the belt comes back, return keyboard focus to the slip it left from
	useEffect(() => {
		if (open) {
			lastSelected.current = selectedKey;
			return;
		}
		const key = lastSelected.current;
		const slip = key ? slipRefs.current.get(key) : undefined;
		const focused = document.activeElement;
		const focusWasOnReceipt =
			focused === document.body || !!focused?.closest(`#${ids.receipt}`);
		if (slip && slip.offsetParent !== null && focusWasOnReceipt) {
			slip.focus({ preventScroll: true });
		}
	}, [open, selectedKey, ids.receipt]);

	// on narrow screens the basket is fully off-screen while the receipt shows
	useEffect(() => {
		listRef.current?.toggleAttribute(
			"inert",
			open && layout.inertBasketWhenOpen,
		);
	}, [open, layout.inertBasketWhenOpen]);

	// top-down "falling stack" order
	const fallOrder = useMemo(() => {
		const order = layout.slots
			.map((slot, i) => ({ i, cy: slot.cy }))
			.sort((a, b) => a.cy - b.cy)
			.map(({ i }) => i);
		return layout.slots.map((_, i) => order.indexOf(i));
	}, [layout.slots]);

	return (
		<div ref={listRef} id={ids.basket}>
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={basketKey}
					className="absolute left-0 top-0"
					exit={{
						opacity: 0,
						y: 30,
						transition: { duration: reduceMotion ? 0 : 0.18 },
					}}
				>
					{pageFaqs.length === 0 && (
						<div
							className="absolute"
							style={{
								left: u(layout.slots[0].cx),
								top: u(layout.slots[0].cy),
								transform: "translate(-50%, -50%) rotate(-2deg)",
							}}
						>
							<QuestionSlip
								question="No questions here yet, check back soon!"
								variant="short"
								paperIndex={0}
								u={slipU}
								disabled
							/>
						</div>
					)}
					{pageFaqs.slice(0, layout.slots.length).map((faq, i) => {
						const slot = layout.slots[i];
						const selected = faq.id === selectedKey;
						return (
							<div
								key={faq.id}
								className="absolute focus-within:!z-40 hover:!z-40"
								style={{
									left: u(slot.cx),
									top: u(slot.cy),
									zIndex: selected ? 40 : 10 + i,
									transform: `translate(-50%, -50%) rotate(${slot.rotate}deg) skewX(${slot.skew}deg)`,
								}}
							>
								<motion.div
									initial={
										reduceMotion
											? false
											: { y: -320, opacity: 0, rotate: i % 2 ? 9 : -9 }
									}
									animate={{ y: 0, opacity: 1, rotate: 0 }}
									transition={{
										type: "spring",
										stiffness: 230,
										damping: 19,
										mass: 0.8,
										delay: 0.08 + fallOrder[i] * 0.09,
									}}
								>
									<QuestionSlip
										ref={(el) => {
											if (el) slipRefs.current.set(faq.id, el);
											else slipRefs.current.delete(faq.id);
										}}
										question={faq.question}
										variant={getSlipVariant(faq.question)}
										paperIndex={i}
										u={slipU}
										selected={selected}
										onSelect={() => select(faq.id)}
										controlsId={ids.receipt}
									/>
								</motion.div>
							</div>
						);
					})}
				</motion.div>
			</AnimatePresence>

			{pageCount > 1 && (
				<button
					type="button"
					onClick={nextPage}
					className="group absolute z-50 flex items-center justify-center font-handwritten text-black transition-transform duration-200 ease-out hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ih-blue active:scale-95"
					style={{
						left: u(layout.moreButton.cx),
						top: u(layout.moreButton.cy),
						width: u(230 * layout.moreButton.scale),
						height: u(64 * layout.moreButton.scale),
						fontSize: u(20 * layout.moreButton.scale),
						transform: `translate(-50%, -50%) rotate(${layout.moreButton.rotate}deg)`,
					}}
				>
					<Image
						src={slipShort2}
						alt=""
						aria-hidden="true"
						fill
						draggable={false}
						className="pointer-events-none object-fill drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)]"
					/>
					<span className="relative group-hover:font-bold">
						more questions ({page + 1}/{pageCount}) &rarr;
					</span>
				</button>
			)}
		</div>
	);
}
