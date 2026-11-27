import Image from "next/image";
import { ReactNode } from "react";

import basket from "./assets/basket.svg";
import conveyorDivider from "./assets/conveyor-divider.svg";
import headerPaper from "./assets/header-paper.svg";
import headerRedLine from "./assets/header-red-line.svg";
import headerSlotLine from "./assets/header-slot-line.svg";
import tag from "./assets/tag.svg";
import tagOutline from "./assets/tag-outline.svg";
import AnswerReceipt from "./AnswerReceipt";
import CategoryRegister from "./CategoryRegister";
import ConveyorTrack from "./ConveyorTrack";
import FAQList from "./FAQList";
import FAQProvider from "./FAQProvider";
import {
	FAQ_LAYOUTS,
	FAQLayout,
	LayoutName,
	PlacedItem,
	Unit,
	getFAQIds,
	makeUnit,
} from "./faqLayout";

export type FAQCategory = "general" | "logistics" | "registration" | "other";

export interface FAQ {
	id: string;
	category: FAQCategory;
	question: string;
	/** plain text or JSX (e.g. paragraphs and links) printed on the receipt */
	answer: ReactNode;
}

// TODO: placeholder questions, replace with the real IrvineHacks 2027 FAQs
const FAQS: FAQ[] = [
	{
		id: "what-is-a-hackathon",
		category: "general",
		question: "What is a hackathon?",
		answer:
			"A hackathon is an event where students team up to build a project from scratch in a short amount of time. We don’t expect hackers to have any prior experience. We will be providing starter packs and workshops to help new hackers get started on projects and learn new technologies.",
	},
	{
		id: "who-can-participate",
		category: "general",
		question: "Who can participate in IrvineHacks?",
		answer: "Placeholder answer for who can participate in IrvineHacks.",
	},
	{
		id: "prior-experience",
		category: "general",
		question: "Do I need prior coding experience to attend?",
		answer: "Placeholder answer about prior coding experience.",
	},
	{
		id: "cost",
		category: "general",
		question: "How much does it cost to attend?",
		answer: "Placeholder answer about the cost of attending.",
	},
	{
		id: "location",
		category: "logistics",
		question: "Where is IrvineHacks held?",
		answer: "Placeholder answer about where the event is held.",
	},
	{
		id: "food",
		category: "logistics",
		question: "Will food be provided during the event?",
		answer: "Placeholder answer about food during the event.",
	},
	{
		id: "overnight",
		category: "logistics",
		question:
			"Will overnight accommodations be provided given that IrvineHacks is a multi-day event?",
		answer: "Placeholder answer about overnight accommodations.",
	},
	{
		id: "what-to-bring",
		category: "logistics",
		question: "What should I bring with me?",
		answer: "Placeholder answer about what to bring.",
	},
	{
		id: "applications-open",
		category: "registration",
		question: "When do applications open?",
		answer: "Placeholder answer about when applications open.",
	},
	{
		id: "teams",
		category: "registration",
		question: "Can I apply with a team, or do I need to find one at the event?",
		answer: "Placeholder answer about applying with a team.",
	},
	{
		id: "acceptance",
		category: "registration",
		question: "How will I know if I’ve been accepted?",
		answer: "Placeholder answer about acceptance notifications.",
	},
	{
		id: "volunteer-mentor",
		category: "other",
		question: "Can I volunteer or mentor instead of hacking?",
		answer: "Placeholder answer about volunteering and mentoring.",
	},
	{
		id: "swag",
		category: "other",
		question: "Will there be swag?",
		answer: "Placeholder answer about swag.",
	},
	{
		id: "contact",
		category: "other",
		question: "Who can I contact with other questions?",
		answer: "Placeholder answer about who to contact.",
	},
];

/* ------------------------------------------------------------------------ */
/* Static pieces of the checkout scene (server rendered)                     */
/* ------------------------------------------------------------------------ */

interface ConveyorBeltProps {
	belt: FAQLayout["belt"];
	u: Unit;
}

/** Full-bleed checkout belt (Figma: "Conveyer Belt", 1920px wide). */
function ConveyorBelt({ belt, u }: ConveyorBeltProps) {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute left-1/2 w-screen -translate-x-1/2 bg-[#c6c4c0]"
			style={{ top: u(belt.top), height: u(belt.height) }}
		>
			<div
				className="absolute inset-x-0 top-0 bg-[#898989]"
				style={{
					height: u(belt.rail),
					boxShadow: `0 ${u(3)} ${u(4)} rgba(49, 49, 49, 0.25)`,
				}}
			/>
			<div
				className="absolute inset-x-0 bottom-0 bg-[#898989]"
				style={{
					height: u(belt.rail),
					boxShadow: `0 -${u(3)} ${u(4)} rgba(49, 49, 49, 0.25)`,
				}}
			/>
		</div>
	);
}

interface PlacedImageProps {
	item: PlacedItem;
	u: Unit;
	className?: string;
	style?: React.CSSProperties;
}

/** An illustration positioned by its center point in design units. */
function PlacedImage({ item, u, className = "", style }: PlacedImageProps) {
	const { src, cx, cy, width, height, rotate, flipY } = item;
	return (
		<Image
			src={src}
			alt=""
			aria-hidden="true"
			draggable={false}
			className={`pointer-events-none absolute max-w-none select-none ${className}`}
			style={{
				left: u(cx - width / 2),
				top: u(cy - height / 2),
				width: u(width),
				height: u(height),
				transform: `rotate(${rotate}deg)${flipY ? " scaleY(-1)" : ""}`,
				...style,
			}}
		/>
	);
}

interface FAQHeaderProps {
	header: FAQLayout["header"];
	u: Unit;
	headingId: string;
}

/** Receipt paper sticking out of the register with the "FAQ's" heading. */
function FAQHeader({ header, u, headingId }: FAQHeaderProps) {
	const { paper, paperClipY, title, redLine, slotLine } = header;

	return (
		<>
			{/* paper is clipped where it disappears into the register's slot */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute z-10 overflow-hidden"
				style={{
					left: u(paper.left),
					top: u(paper.top),
					width: u(paper.width),
					height: u(paperClipY - paper.top),
				}}
			>
				<Image
					src={headerPaper}
					alt=""
					draggable={false}
					className="absolute left-0 top-0 max-w-none -scale-y-100"
					style={{ width: u(paper.width), height: u(paper.height) }}
				/>
			</div>

			<h2
				id={headingId}
				className="absolute z-10 m-0 -translate-x-1/2 whitespace-nowrap font-londrina font-normal leading-normal text-ih-green [text-shadow:0px_2px_4px_rgba(0,0,0,0.25)]"
				style={{
					left: u(title.cx),
					top: u(title.top),
					fontSize: u(title.fontSize),
					letterSpacing: u(title.tracking),
				}}
			>
				FAQ&rsquo;s
			</h2>

			<Image
				src={headerRedLine}
				alt=""
				aria-hidden="true"
				draggable={false}
				className="pointer-events-none absolute z-10 max-w-none"
				style={{
					left: u(redLine.cx - redLine.width / 2),
					top: u(redLine.cy - redLine.height / 2),
					width: u(redLine.width),
					height: u(redLine.height),
					transform: `rotate(${redLine.rotate}deg)`,
				}}
			/>

			<Image
				src={headerSlotLine}
				alt=""
				aria-hidden="true"
				draggable={false}
				className="pointer-events-none absolute z-10 max-w-none"
				style={{
					left: u(slotLine.left),
					top: u(slotLine.top),
					width: u(slotLine.width),
					height: u(slotLine.height),
				}}
			/>
		</>
	);
}

const CONTACT_EMAIL = "hack@uci.edu";

interface EmailTagProps {
	placement: FAQLayout["header"]["tag"];
	u: Unit;
}

/** Pink price-tag sticker on the register (Figma: "tag"). */
function EmailTag({ placement, u }: EmailTagProps) {
	const { cx, cy, scale: s } = placement;
	// Figma: 112px sticker circle, star tag & text slightly offset from its center
	const size = 112 * s;

	return (
		<a
			href={`mailto:${CONTACT_EMAIL}`}
			aria-label={`Email ${CONTACT_EMAIL} with additional questions`}
			className="group absolute z-20 block rounded-full transition-transform duration-200 ease-out hover:scale-[1.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ih-blue active:scale-[0.97]"
			style={{
				left: u(cx - size / 2),
				top: u(cy - size / 2),
				width: u(size),
				height: u(size),
			}}
		>
			<span
				aria-hidden="true"
				className="absolute inset-0 block"
				style={{ transform: "rotate(3.78deg)" }}
			>
				<Image
					src={tagOutline}
					alt=""
					draggable={false}
					className="absolute max-w-none"
					style={{
						left: u(-2.8 * s),
						top: 0,
						width: u(123.2 * s),
						height: u(123.2 * s),
					}}
				/>
				<Image
					src={tag}
					alt=""
					draggable={false}
					className="absolute max-w-none"
					style={{
						left: u((56 - 3.4 - 48.5) * s),
						top: u((56 - 0.1 - 48.5) * s),
						width: u(97 * s),
						height: u(97 * s),
					}}
				/>
				<span
					className="absolute flex items-center justify-center text-center font-handwritten text-white group-hover:font-bold"
					style={{
						left: u((56 - 1.6 - 39.4) * s),
						top: u((56 - 1.6 - 37.5) * s),
						width: u(78.8 * s),
						height: u(75 * s),
						fontSize: u(15 * s),
						lineHeight: u(14 * s),
					}}
				>
					email @irvinehacks with additional questions!
				</span>
			</span>
		</a>
	);
}

/* ------------------------------------------------------------------------ */
/* Scene                                                                     */
/* ------------------------------------------------------------------------ */

/**
 * The checkout scene drawn in Figma units (see faqLayout.ts). The desktop
 * scene matches the Figma frames 1:1; the mobile one re-arranges the same
 * pieces for portrait screens.
 */
function FAQScene({ layoutName }: { layoutName: LayoutName }) {
	const layout = FAQ_LAYOUTS[layoutName];
	const u = makeUnit(layout.base);
	const ids = getFAQIds(layoutName);
	const { basket: basketPlacement, divider } = layout;

	return (
		<div
			role="region"
			aria-labelledby={ids.heading}
			className="relative mx-auto w-full [container-type:inline-size]"
			style={{ maxWidth: layout.maxWidth }}
		>
			<div className="relative" style={{ height: u(layout.stageHeight) }}>
				<ConveyorBelt belt={layout.belt} u={u} />

				<CategoryRegister layoutName={layoutName} />
				<FAQHeader header={layout.header} u={u} headingId={ids.heading} />
				<EmailTag placement={layout.header.tag} u={u} />

				<ConveyorTrack
					layoutName={layoutName}
					checkout={
						<>
							<AnswerReceipt layoutName={layoutName} />
							{layout.sideItems.map((item, i) => (
								<PlacedImage key={i} item={item} u={u} />
							))}
						</>
					}
				>
					<Image
						src={basket}
						alt=""
						aria-hidden="true"
						draggable={false}
						className="pointer-events-none absolute max-w-none select-none"
						style={{
							left: u(basketPlacement.cx - basketPlacement.width / 2),
							top: u(basketPlacement.cy - basketPlacement.height / 2),
							width: u(basketPlacement.width),
							height: u(basketPlacement.height),
							// the mobile basket is turned 90deg around its center
							transform: `rotate(${basketPlacement.rotate}deg)`,
						}}
					/>
					{layout.groceries.map((item, i) => (
						<PlacedImage key={i} item={item} u={u} />
					))}

					<FAQList layoutName={layoutName} />

					{/* checkout divider */}
					<Image
						src={conveyorDivider}
						alt=""
						aria-hidden="true"
						draggable={false}
						className="pointer-events-none absolute max-w-none select-none"
						style={{
							left: u(divider.cx - divider.width / 2),
							top: u(divider.cy - divider.height / 2),
							width: u(divider.width),
							height: u(divider.height),
						}}
					/>
				</ConveyorTrack>
			</div>
		</div>
	);
}

const FAQ = () => {
	return (
		<FAQProvider faqs={FAQS}>
			<section
				id="faq"
				aria-label="Frequently asked questions"
				className="relative w-full overflow-hidden bg-cream"
			>
				{/* the illustration is re-composed for portrait screens */}
				<div className="lg:hidden">
					<FAQScene layoutName="mobile" />
				</div>
				<div className="hidden lg:block">
					<FAQScene layoutName="desktop" />
				</div>
			</section>
		</FAQProvider>
	);
};

export default FAQ;
