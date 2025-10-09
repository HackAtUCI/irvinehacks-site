import axios from "axios";
import { cookies } from "next/headers";

const LOCAL_API_URL = "http://localhost:8000";
const SERVER_HOST = process.env.VERCEL_URL;

// The Vercel Serverless Function for the API lives outside the scope of Next.js
// so the publicly deployed URL must be used instead of a rewrite
const api = axios.create({
	baseURL: SERVER_HOST ? `https://${SERVER_HOST}/api/` : LOCAL_API_URL,
});

api.interceptors.request.use((config) => {
	const cookieStore = cookies();

	// Inject user's client-side cookies along with API request
	const provided = config.headers.get("Cookie");
	const newCookies = (provided ? `${provided}; ` : "") + cookieStore.toString();
	config.headers.set("Cookie", newCookies);
	config.headers.set("X-Hackathon-Name", "zothacks");

	return config;
});

export default api;
