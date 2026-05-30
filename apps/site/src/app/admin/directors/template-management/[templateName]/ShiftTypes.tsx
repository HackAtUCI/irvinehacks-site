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

export type APIShift = {
	shift_name?: string;
	location?: string;
	min_num_organizers?: number;
	shift_pts?: number;
	committee_prereq?: string;
	subcommittee_prereq?: string;
	preassigned_orgs?: string[];

	hour?: {
		start_time?: string;
		end_time?: string;
		director_on_shift?: string[];
	};
};
