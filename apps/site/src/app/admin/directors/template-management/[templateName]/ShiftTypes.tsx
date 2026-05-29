export interface Shift {
	id: string;
	shiftName: string;
	location: string;
	num_orgs: string;
	startDate: string;
	startTime: string;
	endDate: string;
	endTime: string;
	pointValue: string;
	requiredCommittee: string;
	requiredSubcommittee: string;
	preAssignedOrganizers: string[];
}

export interface ShiftErrors {
	shiftName?: string;
	location?: string;
	num_orgs?: string;
	pointValue?: string;
	startDate?: string;
	startTime?: string;
	endDate?: string;
	endTime?: string;
}
