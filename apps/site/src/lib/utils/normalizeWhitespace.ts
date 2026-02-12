export default function normalizeWhitespace(str: string) {
	return str.trim().replace(/\s+/g, " ");
}
