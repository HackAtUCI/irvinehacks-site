// All server-side API requests are handled by lib/utils/api.ts
// but this rewrite still exists for locally testing native POST requests
const LOCAL_API_URL = "http://localhost:8000";

// When deployed on Vercel, this path acts like a rewrite in vercel.json
// Next.js would normally be unable to find the API endpoint
// but Vercel somehow steps in and makes the Serverless Function visible
const VERCEL_API_PATH = "/api/";

/** @type {import('next').NextConfig} */
const nextConfig = {
	rewrites: async () => {
		return [
			{
				source: "/api/:path*",
				destination:
					process.env.NODE_ENV === "development"
						? `${LOCAL_API_URL}/:path*`
						: VERCEL_API_PATH,
			},
		];
	},
	async redirects() {
		return [
			{
				source: "/mentor",
				destination: "https://forms.gle/yCmXvG89ygvxUSCd7",
				permanent: true,
			},
			{
				source: "/volunteer",
				destination: "https://forms.gle/erpJjErKLJkEZMw48",
				permanent: true,
			},
		];
	},
};
