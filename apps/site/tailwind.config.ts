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
				heading: ["Ethnocentric"],
				display: ["NicoMoji"],
				sans: ["Lexend Giga"],
				cantarell: ["Cantarell", "sans-serif"],
				storefront: ['"Lilita One"', "cursive"],
				londrina: ['"Londrina Solid"', "cursive"],
				geo: ['"Geo"', "sans-serif"],
				nunito: ['"Nunito Sans"', "sans-serif"],
				handwritten: ['"Single Day"', "cursive"],
				chakra: ['"Chakra Petch"', "sans-serif"],
				inter: ['"Inter"', "sans-serif"],
			},
			colors: {
				white: "var(--color-white)",
				offwhite: "var(--color-offwhite)",
				black: "var(--color-black)",
				brown: "var(--color-brown)",
				"light-blue": "var(--color-light-blue)",
				midnight: "var(--color-midnight)",

				yellow: "var(--color-yellow)",
				pink: "var(--color-pink)",
				"dark-blue": "var(--color-dark-blue)",
				blue: "var(--color-blue)",
				turquoise: "var(--color-turquoise)",

				cream: "var(--color-cream)",
				coral: "var(--color-coral)",
				"ih-blue": "var(--color-ih-blue)",
				"ih-green": "var(--color-ih-green)",
				"ih-yellow": "var(--color-ih-yellow)",
				"ih-pink": "var(--color-ih-pink)",
				"judge-pink": "var(--color-judge-pink)",
				"action-blue": "var(--color-action-blue)",
				paper: "var(--color-paper)",
				"coupon-bg": "var(--color-coupon-bg)",
				ink: "var(--color-ink)",
				"muted-ink": "var(--color-muted-ink)",
				"wall-line": "var(--color-wall-line)",
				"stripe-blue": "var(--color-stripe-blue)",
				"stripe-green": "var(--color-stripe-green)",
				"sticker-green": "var(--color-sticker-green)",
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
