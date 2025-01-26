import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			keyframes: {
				scroll: {
					from: { transform: "translateX(0)" },
					to: { transform: "translateX(calc(-50%))" },
				},
			},
			animation: {
				scroll: "scroll var(--duration) linear infinite",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			fontFamily: {
				display: ["Aref Ruqaa"],
				body: ["Cantarell"],
				sans: ["Cantarell"],
			},
		},
		screens: {
			xs: "350px",
			...defaultTheme.screens,
		},
	},
	plugins: [],
};
export default config;
