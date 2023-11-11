"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { OrbitControls, View as ViewImpl } from "@react-three/drei";
import { Three } from "@/helpers/components/Three";

const View = forwardRef(({ children, orbit, ...props }: any, ref) => {
	const localRef = useRef<any>();
	useImperativeHandle(ref, () => localRef.current);

	return (
		<>
			<div ref={localRef} {...props} />
			{/* Sends View component thru tunnel to render on global Canvas in Scene.tsx */}
			<Three>
				{/* View component to render 3D view in a div (uses gl.scissor to cut viewport into segments) */}
				<ViewImpl track={localRef}>
					{children}
					{/* drag controls to control camera in View*/}
					{orbit && <OrbitControls />}
				</ViewImpl>
			</Three>
		</>
	);
});
View.displayName = "View";

export { View };
