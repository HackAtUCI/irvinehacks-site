import itertools
from typing import Iterable, Iterator, TypeVar

T = TypeVar("T")


def batched(iterable: Iterable[T], n: int) -> Iterator[tuple[T, ...]]:
    """batched('ABCDEFG', 3) --> ABC DEF G"""
    # from https://docs.python.org/3/library/itertools.html#itertools.batched
    if n < 1:
        raise ValueError("n must be at least one")
    it = iter(iterable)
    while batch := tuple(itertools.islice(it, n)):
        yield batch
