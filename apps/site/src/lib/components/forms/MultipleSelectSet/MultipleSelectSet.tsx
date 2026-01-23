import { useCallback, useMemo, useState } from "react";
import clsx from "clsx";

import { MultipleSelectSetContext } from "./MultipleSelectSetContext";
import RequiredAsterisk from "../RequiredAsterisk";

// A miniscule input that will appear if none of the checkboxes/radios
// are checked. Used to enforce isRequired
function RequiredBlocker() {
	return <input className="w-[1px] h-[1px] bg-black" required />;
}

interface MultipleSelectSetProps {
	children: React.ReactNode;
	isRequired?: boolean;
	className?: string;
	labelText?: string;
}

export function MultipleSelectSet({
	children,
	isRequired,
	className,
	labelText,
}: MultipleSelectSetProps) {
	const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

	const reportChecked = useCallback((id: string, checked: boolean) => {
		setCheckedMap((prev) => {
			if (prev[id] === checked) return prev;
			return { ...prev, [id]: checked };
		});
	}, []);

	const contextValue = useMemo(() => ({ reportChecked }), [reportChecked]);

	const anyChecked = Object.values(checkedMap).some(Boolean);

	return (
		<MultipleSelectSetContext.Provider value={contextValue}>
			<div className={clsx(className)}>
				{labelText && (
					<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">
						{labelText} {isRequired && <RequiredAsterisk />}
						{isRequired && !anyChecked && <RequiredBlocker />}
					</p>
				)}
				{children}
			</div>
		</MultipleSelectSetContext.Provider>
	);
}
