from datetime import datetime, timedelta, timezone

from admin import shift_solver
from models.Availability import AvailabilitySlot
from models.Schedule import Hour, Shift


def make_shift(
    shift_name: str,
    start: datetime,
    end: datetime,
    min_num_organizers: int = 1,
    shift_pts: int = 1,
    committee_prereq: str | None = None,
    preassigned_orgs: list[str] | None = None,
) -> Shift:
    return Shift(
        shift_name=shift_name,
        location="somewhere",
        min_num_organizers=min_num_organizers,
        shift_pts=shift_pts,
        hour=Hour(start_time=start, end_time=end),
        committee_prereq=committee_prereq,
        preassigned_orgs=preassigned_orgs or [],
    )


def slots_between(start: datetime, end: datetime) -> list[AvailabilitySlot]:
    """30-minute availability slots covering [start, end)."""
    slots = []
    current = start
    while current < end:
        slots.append(
            AvailabilitySlot(
                date=current.strftime("%Y-%m-%d"),
                start_time=current.strftime("%H:%M"),
            )
        )
        current += timedelta(minutes=30)
    return slots


DAY = datetime(2026, 10, 17)


def at(hour: int, minute: int = 0, days: int = 0) -> datetime:
    return DAY + timedelta(days=days, hours=hour, minutes=minute)


def test_respects_availability() -> None:
    """Only the available organizer is assigned; the shift is understaffed."""
    shifts = [make_shift("check-in", at(10), at(12), min_num_organizers=2)]
    availability = {
        "org.free": slots_between(at(10), at(12)),
        "org.busy": slots_between(at(14), at(16)),
    }
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=0)

    assert result.status == "optimal"
    assert result.assignments[0] == ["org.free"]
    assert result.understaffed == [0]


def test_partial_availability_is_not_enough() -> None:
    """An organizer must cover every slot of the shift to be assigned."""
    shifts = [make_shift("check-in", at(10), at(12))]
    availability = {"org.partial": slots_between(at(10), at(11, 30))}
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=0)

    assert result.assignments[0] == []
    assert result.understaffed == [0]


def test_respects_committee_prereq() -> None:
    shifts = [
        make_shift("tech desk", at(10), at(12), committee_prereq="Tech"),
    ]
    availability = {
        "org.tech": slots_between(at(10), at(12)),
        "org.design": slots_between(at(10), at(12)),
    }
    committees = {"org.tech": ["Tech"], "org.design": ["Design"]}
    result = shift_solver.solve_shifts(shifts, availability, committees, 0)

    assert result.assignments[0] == ["org.tech"]


def test_honors_preassigned_organizers() -> None:
    """A preassigned organizer is kept even when others could cover."""
    shifts = [
        make_shift("stage", at(10), at(12), preassigned_orgs=["org.star"]),
    ]
    availability = {
        "org.star": slots_between(at(10), at(12)),
        "org.other": slots_between(at(10), at(12)),
    }
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=0)

    assert result.assignments[0] == ["org.star"]
    assert result.warnings == []


def test_impossible_preassignment_is_skipped_with_warning() -> None:
    shifts = [
        make_shift("stage", at(10), at(12), preassigned_orgs=["org.gone"]),
    ]
    availability = {"org.here": slots_between(at(10), at(12))}
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=0)

    assert result.status == "optimal"
    assert result.assignments[0] == ["org.here"]
    assert len(result.warnings) == 1
    assert "org.gone" in result.warnings[0]


def test_never_assigns_overlapping_shifts() -> None:
    """One organizer, two overlapping shifts: only one gets covered."""
    shifts = [
        make_shift("front", at(10), at(12)),
        make_shift("back", at(11), at(13)),
    ]
    availability = {"org.solo": slots_between(at(10), at(13))}
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=0)

    assert result.status == "optimal"
    assigned = [index for index, uids in result.assignments.items() if uids]
    assert len(assigned) == 1
    assert len(result.understaffed) == 1


def test_fills_up_to_minimum_but_not_beyond() -> None:
    shifts = [make_shift("check-in", at(10), at(12), min_num_organizers=2)]
    availability = {f"org.{i}": slots_between(at(10), at(12)) for i in range(4)}
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=0)

    assert result.status == "optimal"
    assert len(result.assignments[0]) == 2
    assert result.understaffed == []


def test_points_floor_spreads_shifts_across_organizers() -> None:
    """With a points floor, each organizer gets a shift instead of one
    organizer taking both."""
    shifts = [
        make_shift("morning", at(9), at(11), shift_pts=2),
        make_shift("evening", at(18), at(20), shift_pts=2),
    ]
    availability = {
        "org.a": slots_between(at(9), at(20)),
        "org.b": slots_between(at(9), at(20)),
    }
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=2)

    assert result.status == "optimal"
    assert result.assignments[0] != result.assignments[1]
    assert result.under_points_floor == []


def test_reports_organizers_under_points_floor() -> None:
    shifts = [make_shift("only", at(10), at(12), shift_pts=1)]
    availability = {
        "org.covered": slots_between(at(10), at(12)),
        "org.unavailable": slots_between(at(20), at(22)),
    }
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=3)

    assert result.status == "optimal"
    assert result.assignments[0] == ["org.covered"]
    assert result.under_points_floor == ["org.covered", "org.unavailable"]


def test_avoids_overnight_assignment_when_alternative_exists() -> None:
    """Two organizers can each take one side of midnight; neither should
    work both sides."""
    shifts = [
        make_shift("late", at(22), at(23, 30)),
        make_shift("early", at(0, 30, days=1), at(2, days=1)),
    ]
    availability = {
        "org.a": slots_between(at(22), at(2, days=1)),
        "org.b": slots_between(at(22), at(2, days=1)),
    }
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=0)

    assert result.status == "optimal"
    assert result.assignments[0] != result.assignments[1]
    assert len(result.assignments[0]) == 1
    assert len(result.assignments[1]) == 1


def test_conflicting_preassignments_are_infeasible() -> None:
    """The same organizer preassigned to two overlapping shifts cannot be
    satisfied."""
    shifts = [
        make_shift("front", at(10), at(12), preassigned_orgs=["org.solo"]),
        make_shift("back", at(11), at(13), preassigned_orgs=["org.solo"]),
    ]
    availability = {"org.solo": slots_between(at(10), at(13))}
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=0)

    assert result.status == "infeasible"


def test_timezone_aware_shift_matches_naive_availability() -> None:
    """Shift datetimes with a timezone suffix are compared by wall clock,
    matching the frontend's string-sliced availability grid."""
    shifts = [
        make_shift(
            "aware",
            at(10).replace(tzinfo=timezone.utc),
            at(12).replace(tzinfo=timezone.utc),
        )
    ]
    availability = {"org.local": slots_between(at(10), at(12))}
    result = shift_solver.solve_shifts(shifts, availability, {}, minimum_pts=0)

    assert result.assignments[0] == ["org.local"]


def test_no_organizers_at_all() -> None:
    shifts = [make_shift("empty", at(10), at(12))]
    result = shift_solver.solve_shifts(shifts, {}, {}, minimum_pts=0)

    assert result.status == "optimal"
    assert result.assignments == {0: []}
    assert result.understaffed == [0]


def test_shifts_without_candidates() -> None:
    shifts = [
        make_shift("covered", at(10), at(12)),
        make_shift("uncoverable", at(3), at(5), committee_prereq="Tech"),
    ]
    availability = {"org.a": slots_between(at(3), at(12))}
    committees = {"org.a": ["Design"]}

    assert shift_solver.shifts_without_candidates(shifts, availability, committees) == [
        "uncoverable"
    ]
