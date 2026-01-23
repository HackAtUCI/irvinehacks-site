import { createContext, useContext } from "react";

interface MultipleSelectSetContextValue {
	reportChecked: (id: string, checked: boolean) => void;
}

export const MultipleSelectSetContext =
	createContext<MultipleSelectSetContextValue | null>(null);

export const useMultipleSelectSet = () => useContext(MultipleSelectSetContext);
