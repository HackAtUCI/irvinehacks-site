"use client";

import { createContext, useContext } from "react";

export type DraftFieldValue = string | number;

export interface DraftContextValue {
	initialValues: Record<string, DraftFieldValue>;
	setValue: (name: string, value: DraftFieldValue) => void;
}

export const DraftContext = createContext<DraftContextValue | null>(null);

export function useDraftContext() {
	return useContext(DraftContext);
}
