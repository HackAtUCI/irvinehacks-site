"use client";

import Image from "next/image";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";

import backArrow from "./assets/back-arrow.svg";
import receiptBack1 from "./assets/receipt-back-1.svg";
import receiptBack2 from "./assets/receipt-back-2.svg";
import receiptFront from "./assets/receipt-front.svg";
import receiptLogo from "./assets/receipt-logo.svg";
import { useFAQ } from "./FAQProvider";
import {
	FAQ_LAYOUTS,
	LayoutName,
	SLIDE_MS,
	getCategoryLabel,
	getFAQIds,
	makeUnit,
	Unit,
} from "./faqLayout";
import type { FAQ } from "./FAQ";

const RECEIPT_WIDTH = 468.5;
const RECEIPT_HEIGHT = 640.9;
const PAPER = { width: 398.8, height: 598.5 };
const TEXT_ROTATION = "rotate(7.59deg)";

interface AnswerReceiptProps {
	faq: FAQ | null;
	u: Unit;
	open: boolean;
	onBack: () => void;
	id: string;
	style?: React.CSSProperties;
}

function DottedRule({ u, cx, cy }: { u: Unit; cx: number; cy: number }) {
	const width = 235.6;
	return (
		<div
			aria-hidden="true"
			className="absolute"
			style={{
				left: u(cx - width / 2),
				top: u(cy),
				width: u(width),
				height: u(0.6),
				transform: TEXT_ROTATION,
				backgroundImage: `repeating-linear-gradient(90deg, #000 0 ${u(
					2.5,
				)}, transparent ${u(2.5)} ${u(5)})`,
			}}
		/>
	);
}

/** Receipt that prints the answer of the selected FAQ. */
const ReceiptView = forwardRef<HTMLButtonElement, AnswerReceiptProps>(
	function ReceiptView({ faq, u, open, onBack, id, style }, backRef) {
		const paperStyle = (
			cx: number,
			cy: number,
			rotate: number,
		): React.CSSProperties => ({
			left: u(cx - PAPER.width / 2),
			top: u(cy - PAPER.height / 2),
			width: u(PAPER.width),
			height: u(PAPER.height),
			transform: `rotate(${rotate}deg)`,
		});

		return (
			<div
				id={id}
				role="region"
				aria-label="Answer"
				aria-live="polite"
				className="absolute"
				style={{ width: u(RECEIPT_WIDTH), height: u(RECEIPT_HEIGHT), ...style }}
			>
				<Image
					src={receiptBack1}
					alt=""
					draggable={false}
					className="absolute max-w-none"
					style={paperStyle(234.25, 22.93 + PAPER.height / 2, 0)}
				/>
				<Image
					src={receiptBack2}
					alt=""
					draggable={false}
					className="absolute max-w-none"
					style={paperStyle(234.27, 320.45, -7.38)}
				/>
				<Image
					src={receiptFront}
					alt=""
					draggable={false}
					className="absolute max-w-none"
					style={paperStyle(234.55, 311.6, 4.32)}
				/>

				<DottedRule u={u} cx={260.5} cy={149} />
				<DottedRule u={u} cx={209.75} cy={464.5} />

				<Image
					src={receiptLogo}
					alt="IrvineHacks 2027"
					draggable={false}
					className="absolute max-w-none"
					style={{
						left: u(202.5),
						top: u(39.5),
						width: u(160),
						height: u(114),
					}}
				/>

				{/* answer */}
				<div
					className="absolute flex flex-col"
					style={{
						left: u(239.05 - 258.5 / 2),
						top: u(294.1 - 285 / 2),
						width: u(258.5),
						height: u(285),
						gap: u(10),
						transform: TEXT_ROTATION,
					}}
				>
					<button
						ref={backRef}
						type="button"
						onClick={onBack}
						tabIndex={open ? 0 : -1}
						className="group flex w-fit shrink-0 items-center font-nunito font-bold leading-normal text-[#4795ed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ih-blue"
						style={{ gap: u(8), fontSize: u(20) }}
					>
						{/* Figma: 11 x 15.5 arrow box, the exported stroke overflows it */}
						<span
							aria-hidden="true"
							className="relative block shrink-0 transition-transform duration-200 group-hover:-translate-x-1"
							style={{ width: u(11.03), height: u(15.55) }}
						>
							<Image
								src={backArrow}
								alt=""
								draggable={false}
								className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 rotate-180"
								style={{ width: u(14.4), height: u(21.4) }}
							/>
						</span>
						<span className="underline decoration-from-font [text-underline-position:from-font]">
							Back
						</span>
					</button>
					<div
						className="min-h-0 overflow-y-auto overscroll-contain font-nunito font-normal leading-normal text-black [scrollbar-width:thin]"
						style={{ fontSize: u(20) }}
					>
						{faq && (
							<>
								<p className="sr-only">{faq.question}</p>
								<div className="[&_a]:text-[#4795ed] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:font-bold [&_p+p]:mt-[0.6em] [&_p]:m-0">
									{faq.answer}
								</div>
							</>
						)}
					</div>
				</div>

				{/* receipt totals */}
				<div
					className="absolute flex flex-col whitespace-nowrap font-geo text-black"
					style={{
						left: u(204.4 - 241.2 / 2),
						top: u(513.6 - 74 / 2),
						width: u(241.2),
						fontSize: u(24),
						lineHeight: u(44.089),
						transform: TEXT_ROTATION,
					}}
				>
					<div
						className="flex items-center justify-between"
						style={{ height: u(44.5), marginBottom: u(-15) }}
					>
						<span>Category:</span>
						<span>{faq ? getCategoryLabel(faq.category) : ""}</span>
					</div>
					<div
						className="flex items-center justify-between"
						style={{ height: u(44.5) }}
					>
						<span>Total:</span>
						<span>20.27</span>
					</div>
				</div>
			</div>
		);
	},
);

/** The receipt that slides in on the conveyor with the selected answer. */
export default function AnswerReceipt({
	layoutName,
}: {
	layoutName: LayoutName;
}) {
	const layout = FAQ_LAYOUTS[layoutName];
	const u = useMemo(
		() => makeUnit(layout.base, layout.receipt.scale),
		[layout.base, layout.receipt.scale],
	);
	const outerU = useMemo(() => makeUnit(layout.base), [layout.base]);
	const { open, receiptFaq, back } = useFAQ();
	const reduceMotion = useReducedMotion();
	const backRef = useRef<HTMLButtonElement>(null);

	// once the receipt has arrived, move keyboard focus to it
	useEffect(() => {
		const button = backRef.current;
		if (!open || !button || button.offsetParent === null) return;
		const timeout = window.setTimeout(
			() => button.focus({ preventScroll: true }),
			reduceMotion ? 0 : SLIDE_MS,
		);
		return () => window.clearTimeout(timeout);
	}, [open, reduceMotion]);

	return (
		<ReceiptView
			ref={backRef}
			faq={receiptFaq}
			u={u}
			open={open}
			onBack={back}
			id={getFAQIds(layoutName).receipt}
			style={{
				left: outerU(layout.receipt.left),
				top: outerU(layout.receipt.top),
			}}
		/>
	);
}
