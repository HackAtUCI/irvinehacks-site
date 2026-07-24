// use a hash function as opposed to just completely
// randomizing applicant name so that discussion amongst
// organizers while maintaining subject clarity is still an option

// DOES NOT handle collisons - can increase range to prevent
// e.g. % 900000) + 100000
// but likely not necessary - update in future if it becomes a problem

export function uidToPseudonym(uid: string): string {
	let hash = 5381;
	for (let i = 0; i < uid.length; i++) {
		hash = ((hash << 5) + hash + uid.charCodeAt(i)) >>> 0;
	}
	return `Applicant #${(hash % 9000) + 1000}`;
}
