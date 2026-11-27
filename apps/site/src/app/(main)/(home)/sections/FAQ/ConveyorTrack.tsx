"use client";

import {
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useReducedMotion } from "framer-motion";

import { useFAQ } from "./FAQProvider";
import {
	FAQ_LAYOUTS,
	LayoutName,
	SLIDE_EASING,
	SLIDE_MS,
	makeUnit,
} from "./faqLayout";

const AXIS_LOCK_DISTANCE = 8;
const SWIPE_THRESHOLD = 80;

interface ConveyorDragOptions {
	open: boolean;
	canOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
}

/**
 * Lets the conveyor belt be dragged/swiped sideways: drag right to send the
 * receipt away (back to the questions), drag left to bring the last answer
 * back. Dragging the "wrong" way gives a little rubber-band resistance.
 */
function useConveyorDrag({
	open,
	canOpen,
	onOpen,
	onClose,
}: ConveyorDragOptions) {
	const [offset, setOffset] = useState(0);
	const [dragging, setDragging] = useState(false);

	const start = useRef<{ x: number; y: number } | null>(null);
	const axis = useRef<"x" | "y" | null>(null);
	const suppressClick = useRef(false);
	const offsetRef = useRef(0);

	const reset = useCallback(() => {
		start.current = null;
		axis.current = null;
		offsetRef.current = 0;
		setOffset(0);
		setDragging(false);
	}, []);

	const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
		if (e.pointerType === "mouse" && e.button !== 0) return;
		suppressClick.current = false;
		start.current = { x: e.clientX, y: e.clientY };
		axis.current = null;
	}, []);

	const onPointerMove = useCallback(
		(e: React.PointerEvent<HTMLElement>) => {
			if (!start.current) return;
			const dx = e.clientX - start.current.x;
			const dy = e.clientY - start.current.y;

			if (!axis.current) {
				if (Math.hypot(dx, dy) < AXIS_LOCK_DISTANCE) return;
				axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
				if (axis.current === "x") {
					e.currentTarget.setPointerCapture(e.pointerId);
					setDragging(true);
				}
			}
			if (axis.current !== "x") return;

			const allowed = open ? dx > 0 : canOpen && dx < 0;
			const next = dx * (allowed ? 0.7 : 0.15);
			offsetRef.current = next;
			setOffset(next);
		},
		[open, canOpen],
	);

	const onPointerUp = useCallback(() => {
		if (axis.current === "x") {
			suppressClick.current = true;
			const travelled = offsetRef.current;
			if (open && travelled > SWIPE_THRESHOLD) onClose();
			else if (!open && canOpen && travelled < -SWIPE_THRESHOLD) onOpen();
		}
		reset();
	}, [open, canOpen, onOpen, onClose, reset]);

	/** swallow the click that ends a drag so it doesn't select a slip */
	const onClickCapture = useCallback((e: React.MouseEvent) => {
		if (suppressClick.current) {
			suppressClick.current = false;
			e.stopPropagation();
			e.preventDefault();
		}
	}, []);

	return {
		offset,
		dragging,
		handlers: {
			onPointerDown,
			onPointerMove,
			onPointerUp,
			onPointerCancel: reset,
			onClickCapture,
		},
	};
}

interface ConveyorTrackProps {
	layoutName: LayoutName;
	/** basket, groceries, slips and the divider */
	children: ReactNode;
	/** receipt and groceries past the divider, revealed with an answer */
	checkout: ReactNode;
}

/**
 * Everything riding on the conveyor belt. Selecting a question slides the
 * belt left to the receipt; it can also be dragged / swiped back and forth.
 */
export default function ConveyorTrack({
	layoutName,
	children,
	checkout,
}: ConveyorTrackProps) {
	const layout = FAQ_LAYOUTS[layoutName];
	const u = useMemo(() => makeUnit(layout.base), [layout.base]);
	const { open, canResume, resume, back } = useFAQ();
	const reduceMotion = useReducedMotion();
	const checkoutRef = useRef<HTMLDivElement>(null);

	const { offset, dragging, handlers } = useConveyorDrag({
		open,
		canOpen: canResume,
		onOpen: resume,
		onClose: back,
	});

	// the receipt can't be reached while it is off the belt
	useEffect(() => {
		checkoutRef.current?.toggleAttribute("inert", !open);
	}, [open]);

	const { track, belt } = layout;
	const slideDuration = reduceMotion ? 0 : SLIDE_MS;

	return (
		<div
			{...handlers}
			className={`absolute inset-x-0 touch-pan-y ${
				dragging ? "cursor-grabbing select-none" : ""
			}`}
			style={{ top: u(belt.top), height: u(belt.height) }}
		>
			<div
				className="absolute"
				style={{
					left: u(track.left),
					top: u(track.top - belt.top),
					transform: `translate3d(calc(${u(
						open ? -track.shift : 0,
					)} + ${offset}px), 0, 0)`,
					transition: dragging
						? "none"
						: `transform ${slideDuration}ms ${SLIDE_EASING}`,
					willChange: "transform",
				}}
			>
				{children}
				{/* fades in as it rides in and out at the very end as it leaves,
				    so nothing peeks in on very wide screens */}
				<div
					ref={checkoutRef}
					aria-hidden={!open}
					style={{
						opacity: open || dragging ? 1 : 0,
						transition: reduceMotion
							? undefined
							: open
							  ? "opacity 300ms ease-out 100ms"
							  : `opacity 250ms ease-in ${slideDuration - 250}ms`,
					}}
				>
					{checkout}
				</div>
			</div>
		</div>
	);
}
