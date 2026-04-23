"use client";

import { createContext, useContext } from "react";

export interface DraftContextValue {
	initialValues: Record<string, string>;
	setValue: (name: string, value: string) => void;
}

export const DraftContext = createContext<DraftContextValue | null>(null);

export function useDraftContext() {
	return useContext(DraftContext);
}
