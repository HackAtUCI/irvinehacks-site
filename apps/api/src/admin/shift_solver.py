"""Assign organizers to shifts with the HiGHS MILP solver.

Time convention: the frontend availability grid is built by string-slicing
shift `hour` datetimes into a date part and an HH:MM part, ignoring any
timezone suffix. Availability slots therefore share the same wall-clock
frame as the shift datetimes as written, so datetimes are normalized by
dropping tzinfo, never by converting between timezones.

Subcommittee prerequisites are not enforced: organizer records only carry
top-level committees.
"""

from datetime import datetime
from typing import Literal

import highspy

from pydantic import BaseModel

from models.Availability import AvailabilitySlot
from models.Schedule import Shift

# Objective weights. Coverage must dominate so the solver never leaves a
# fillable shift empty to dodge a penalty elsewhere.
COVERAGE_REWARD = 1_000  # per organizer assigned to a shift
POINTS_FLOOR_PENALTY = 100  # per point an organizer falls below minimum_pts
OVERNIGHT_PENALTY = 200  # per organizer per midnight worked on both sides

SLOT_MINUTES = 30
SLOTS_PER_DAY = 24 * 60 // SLOT_MINUTES
# 30-minute slots on each side of midnight that count as "overnight" (4 hours)
NIGHT_WINDOW = 8

# Fixed reference for global slot indices; any date before all events works.
_EPOCH = datetime(2000, 1, 1)

_HighsVar = highspy.highs_var


class SolveResult(BaseModel):
    status: Literal["optimal", "feasible", "infeasible"]
    # shift index (position in the input list) -> assigned organizer uids
    assignments: dict[int, list[str]] = {}
    # shifts that ended up below min_num_organizers
    understaffed: list[int] = []
    # organizers whose assigned shift points fall below minimum_pts
    under_points_floor: list[str] = []
    warnings: list[str] = []


def _to_slot_index(dt: datetime) -> float:
    """Wall-clock datetime -> global 30-minute slot index (may be fractional)."""
    naive = dt.replace(tzinfo=None)
    return (naive - _EPOCH).total_seconds() / (SLOT_MINUTES * 60)


def _availability_slot_index(slot: AvailabilitySlot) -> int:
    dt = datetime.fromisoformat(f"{slot.date}T{slot.start_time}")
    return int(_to_slot_index(dt))


def _shift_slot_range(shift: Shift) -> range:
    """The 30-minute slots a shift spans, [start, end).

    Unaligned times are widened outward so partial slots still require
    availability.
    """
    start = _to_slot_index(shift.hour.start_time)
    end = _to_slot_index(shift.hour.end_time)
    return range(int(start), int(-(-end // 1)))


def _eligible_organizers(
    shift: Shift,
    slot_range: range,
    availability_slots: dict[str, set[int]],
    committees: dict[str, list[str]],
) -> list[str]:
    """Organizers whose availability covers the whole shift and who satisfy
    the shift's committee prerequisite."""
    eligible = []
    for uid, slots in availability_slots.items():
        if shift.committee_prereq is not None and shift.committee_prereq not in (
            committees.get(uid) or []
        ):
            continue
        if all(s in slots for s in slot_range):
            eligible.append(uid)
    return eligible


def shifts_without_candidates(
    shifts: list[Shift],
    availability: dict[str, list[AvailabilitySlot]],
    committees: dict[str, list[str]],
) -> list[str]:
    """Names of shifts that no organizer is both available and eligible for."""
    availability_slots = {
        uid: {_availability_slot_index(slot) for slot in slots}
        for uid, slots in availability.items()
    }
    return [
        shift.shift_name
        for shift in shifts
        if shift.min_num_organizers > 0
        and not _eligible_organizers(
            shift, _shift_slot_range(shift), availability_slots, committees
        )
    ]


def solve_shifts(
    shifts: list[Shift],
    availability: dict[str, list[AvailabilitySlot]],
    committees: dict[str, list[str]],
    minimum_pts: int,
    time_limit_s: float = 10.0,
) -> SolveResult:
    warnings: list[str] = []

    availability_slots = {
        uid: {_availability_slot_index(slot) for slot in slots}
        for uid, slots in availability.items()
    }
    slot_ranges = [_shift_slot_range(shift) for shift in shifts]

    solver = highspy.Highs()
    solver.silent()
    solver.setOptionValue("time_limit", time_limit_s)

    # Availability + eligibility (hard): variables only exist for organizers
    # who can actually work the shift.
    x: dict[tuple[str, int], _HighsVar] = {}
    for index, shift in enumerate(shifts):
        for uid in _eligible_organizers(
            shift, slot_ranges[index], availability_slots, committees
        ):
            x[uid, index] = solver.addBinary()

    # Preassignments (hard, skipped with a warning when impossible)
    preassigned_counts = [0] * len(shifts)
    for index, shift in enumerate(shifts):
        for uid in shift.preassigned_orgs:
            if (uid, index) in x:
                solver.addConstr(x[uid, index] == 1)
                preassigned_counts[index] += 1
            else:
                warnings.append(
                    f"Preassigned organizer {uid} is not available or eligible"
                    f" for shift '{shift.shift_name}'; skipped."
                )

    # Per-shift capacity (hard): min_num_organizers is the staffing target,
    # never exceeded, except when preassignments already exceed it.
    for index, shift in enumerate(shifts):
        organizer_vars = [x[uid, index] for uid in _shift_uids(x, index)]
        if organizer_vars:
            capacity = max(shift.min_num_organizers, preassigned_counts[index])
            solver.addConstr(solver.qsum(organizer_vars) <= capacity)

    # No overlapping shifts per organizer (hard): at most one of the
    # organizer's shifts may cover any given 30-minute slot.
    organizer_uids = sorted({uid for uid, _ in x})
    for uid in organizer_uids:
        shifts_by_slot: dict[int, list[int]] = {}
        for index in _organizer_shifts(x, uid):
            for slot in slot_ranges[index]:
                shifts_by_slot.setdefault(slot, []).append(index)
        seen: set[tuple[int, ...]] = set()
        for indices in shifts_by_slot.values():
            key = tuple(indices)
            if len(indices) > 1 and key not in seen:
                seen.add(key)
                solver.addConstr(solver.qsum([x[uid, index] for index in indices]) <= 1)

    # Points floor (soft): penalize each point an organizer falls below
    # minimum_pts so drafts still generate when staffing is short.
    shortfalls: dict[str, _HighsVar] = {}
    no_eligible_shifts: list[str] = []
    for uid in sorted(availability_slots):
        indices = _organizer_shifts(x, uid)
        if not indices:
            if minimum_pts > 0:
                no_eligible_shifts.append(uid)
            continue
        if minimum_pts > 0:
            shortfall = solver.addVariable(lb=0, ub=minimum_pts)
            points = solver.qsum(
                [shifts[index].shift_pts * x[uid, index] for index in indices]
            )
            solver.addConstr(points + shortfall >= minimum_pts)
            shortfalls[uid] = shortfall

    # Overnight (soft): penalize working both sides of a midnight boundary
    # within the night window.
    overnight_vars: list[_HighsVar] = []
    for uid in organizer_uids:
        boundaries: set[int] = set()
        for index in _organizer_shifts(x, uid):
            for slot in slot_ranges[index]:
                boundaries.add(slot // SLOTS_PER_DAY * SLOTS_PER_DAY)
                boundaries.add((slot // SLOTS_PER_DAY + 1) * SLOTS_PER_DAY)
        for boundary in boundaries:
            late = _shifts_touching(
                x, uid, slot_ranges, boundary - NIGHT_WINDOW, boundary
            )
            early = _shifts_touching(
                x, uid, slot_ranges, boundary, boundary + NIGHT_WINDOW
            )
            if not late or not early:
                continue
            any_late = solver.addVariable(lb=0, ub=1)
            any_early = solver.addVariable(lb=0, ub=1)
            for index in late:
                solver.addConstr(any_late >= x[uid, index])
            for index in early:
                solver.addConstr(any_early >= x[uid, index])
            overnight = solver.addVariable(lb=0, ub=1)
            solver.addConstr(overnight >= any_late + any_early - 1)
            overnight_vars.append(overnight)

    if not x:
        # Nothing to optimize; every staffed shift is understaffed.
        return SolveResult(
            status="optimal",
            assignments={index: [] for index in range(len(shifts))},
            understaffed=[
                index
                for index, shift in enumerate(shifts)
                if shift.min_num_organizers > 0
            ],
            under_points_floor=no_eligible_shifts,
            warnings=warnings,
        )

    objective = COVERAGE_REWARD * solver.qsum(list(x.values()))
    if shortfalls:
        objective -= POINTS_FLOOR_PENALTY * solver.qsum(list(shortfalls.values()))
    if overnight_vars:
        objective -= OVERNIGHT_PENALTY * solver.qsum(overnight_vars)
    solver.maximize(objective)

    model_status = solver.getModelStatus()
    has_solution = int(solver.getInfo().primal_solution_status) == int(
        highspy.kSolutionStatusFeasible
    )
    if model_status == highspy.HighsModelStatus.kOptimal:
        status: Literal["optimal", "feasible", "infeasible"] = "optimal"
    elif has_solution:
        status = "feasible"
    else:
        return SolveResult(status="infeasible", warnings=warnings)

    assignments = {
        index: sorted(
            uid for uid in _shift_uids(x, index) if solver.val(x[uid, index]) > 0.5
        )
        for index in range(len(shifts))
    }
    understaffed = [
        index
        for index, shift in enumerate(shifts)
        if len(assignments[index]) < shift.min_num_organizers
    ]
    under_points_floor = sorted(
        no_eligible_shifts
        + [uid for uid, var in shortfalls.items() if solver.val(var) > 0.5]
    )
    return SolveResult(
        status=status,
        assignments=assignments,
        understaffed=understaffed,
        under_points_floor=under_points_floor,
        warnings=warnings,
    )


def _shift_uids(x: dict[tuple[str, int], _HighsVar], index: int) -> list[str]:
    return sorted(uid for uid, i in x if i == index)


def _organizer_shifts(x: dict[tuple[str, int], _HighsVar], uid: str) -> list[int]:
    return sorted(index for u, index in x if u == uid)


def _shifts_touching(
    x: dict[tuple[str, int], _HighsVar],
    uid: str,
    slot_ranges: list[range],
    start: int,
    end: int,
) -> list[int]:
    """The organizer's shifts spanning any slot in [start, end)."""
    return [
        index
        for index in _organizer_shifts(x, uid)
        if any(start <= slot < end for slot in slot_ranges[index])
    ]
