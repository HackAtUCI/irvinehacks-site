import normalizeWhitespace from "./normalizeWhitespace";

export default function getWordCount(inputString: string) {
	const normalized = normalizeWhitespace(inputString);
	if (normalized === "") return 0;
	return normalized.split(" ").length;
}
