"use client";

import { PropsWithChildren } from "react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { View as ViewImpl } from "@react-three/drei";
import { Three } from "@/helpers/components/Three";

const View = forwardRef(
	(
		{ className, children }: PropsWithChildren<{ className: string }>,
		ref,
	) => {
		const localRef = useRef<HTMLDivElement>(null);
		useImperativeHandle(ref, () => localRef.current);

		return (
			<>
				<div ref={localRef} className={className} />
				{/* Sends View component thru tunnel to render on global Canvas in Scene.tsx */}
				<Three>
					{/* View component to render 3D view in a div (uses gl.scissor to cut viewport into segments) */}
					<ViewImpl track={localRef}>{children}</ViewImpl>
				</Three>
			</>
		);
	},
);
View.displayName = "View";

export { View };
