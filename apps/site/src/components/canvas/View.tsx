"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { OrbitControls, View as ViewImpl } from "@react-three/drei";
import { Three } from "@/helpers/components/Three";

// export const Common = ({ color }: any) => (
// 	<Suspense fallback={null}>
// 		{color && <color attach="background" args={[color]} />}
// 		<ambientLight intensity={0.5} />
// 		<pointLight position={[20, 30, 10]} intensity={1} />
// 		<pointLight position={[-10, -10, -10]} color="blue" />
// 		<PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />
// 	</Suspense>
// );

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
