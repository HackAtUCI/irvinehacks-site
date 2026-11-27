"use client";

import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { DEFAULT_FAQ_CATEGORY, SLIPS_PER_PAGE } from "./faqLayout";
import type { FAQ, FAQCategory } from "./FAQ";

interface FAQState {
	category: FAQCategory;
	changeCategory: (category: FAQCategory) => void;
	/** questions in the basket right now (current page of the category) */
	pageFaqs: FAQ[];
	page: number;
	pageCount: number;
	nextPage: () => void;
	/** changes whenever the basket gets a new set of slips */
	basketKey: string;
	selectedKey: string | null;
	open: boolean;
	/** what the receipt prints (stays filled while it slides away) */
	receiptFaq: FAQ | null;
	select: (key: string) => void;
	back: () => void;
	/** the last answer can be swiped back onto the belt */
	canResume: boolean;
	resume: () => void;
}

const FAQContext = createContext<FAQState | null>(null);

export function useFAQ() {
	const state = useContext(FAQContext);
	if (!state) throw new Error("useFAQ must be used inside <FAQProvider>");
	return state;
}

/** Shared state of the FAQ section (both the desktop and mobile scene). */
export default function FAQProvider({
	faqs,
	children,
}: PropsWithChildren<{ faqs: FAQ[] }>) {
	const [category, setCategory] = useState<FAQCategory>(DEFAULT_FAQ_CATEGORY);
	const [page, setPage] = useState(0);
	const [selectedKey, setSelectedKey] = useState<string | null>(null);
	const [lastKey, setLastKey] = useState<string | null>(null);

	const categoryFaqs = useMemo(
		() => faqs.filter((faq) => faq.category === category),
		[faqs, category],
	);
	const pageCount = Math.max(
		1,
		Math.ceil(categoryFaqs.length / SLIPS_PER_PAGE),
	);

	const changeCategory = useCallback(
		(next: FAQCategory) => {
			if (next === category) return;
			setSelectedKey(null);
			setLastKey(null);
			setPage(0);
			setCategory(next);
		},
		[category],
	);

	const select = useCallback((key: string) => {
		setSelectedKey(key);
		setLastKey(key);
	}, []);

	const back = useCallback(() => setSelectedKey(null), []);

	const resume = useCallback(() => {
		if (lastKey) setSelectedKey(lastKey);
	}, [lastKey]);

	const nextPage = useCallback(() => {
		setSelectedKey(null);
		setLastKey(null);
		setPage((current) => (current + 1) % pageCount);
	}, [pageCount]);

	const open = selectedKey !== null;

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") back();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, back]);

	const value = useMemo<FAQState>(
		() => ({
			category,
			changeCategory,
			pageFaqs: categoryFaqs.slice(
				page * SLIPS_PER_PAGE,
				(page + 1) * SLIPS_PER_PAGE,
			),
			page,
			pageCount,
			nextPage,
			basketKey: `${category}-${page}`,
			selectedKey,
			open,
			receiptFaq:
				faqs.find(({ id }) => id === (selectedKey ?? lastKey)) ?? null,
			select,
			back,
			canResume: lastKey !== null,
			resume,
		}),
		[
			category,
			changeCategory,
			categoryFaqs,
			page,
			pageCount,
			nextPage,
			selectedKey,
			open,
			faqs,
			lastKey,
			select,
			back,
			resume,
		],
	);

	return <FAQContext.Provider value={value}>{children}</FAQContext.Provider>;
}
