// All server-side API requests are handled by lib/utils/api.ts
// but this rewrite still exists for locally testing native POST requests
const LOCAL_API_URL = "http://localhost:8000";

// When deployed on Vercel, this path acts like a rewrite in vercel.json
// Next.js would normally be unable to find the API endpoint
// but Vercel somehow steps in and makes the Serverless Function visible
const VERCEL_API_PATH = "/api/";

const DOCUSIGN_FORM_URL =
	"https://na3.docusign.net/Member/PowerFormSigning.aspx?" +
	"PowerFormId=f2a69fce-a986-4ad5-9ce9-53f9b544816d" +
	"&env=na3" +
	"&acct=e6262c0d-c7c1-444b-99b1-e5c6ceaa4b40" +
	"&v=2";

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
			{
				source: "/waiver",
				destination: DOCUSIGN_FORM_URL,
				permanent: true,
			},
			{
				source: "/incident",
				destination:
					"https://docs.google.com/forms/d/e/1FAIpQLSehTGeZxoYy5-zQ-dBeEXjvAzy2kc25X8-74LBWbYbW-xMJNQ/viewform",
				permanent: true,
			},
			{
				source: "/devpost",
				destination: "https://irvinehacks-2024.devpost.com",
				permanent: true,
			},
		];
	},
};

module.exports = nextConfig;
