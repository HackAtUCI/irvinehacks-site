import React, { useEffect, useRef } from 'react';

// ... rest of the code ...

	useEffect(() => {
		if (!containerRef.current || !scrollerRef.current) return;

		// Clone items just once for infinite scroll
		const scrollerContent = Array.from(scrollerRef.current.children);
		scrollerContent.forEach((item) => {
			const duplicatedItem = item.cloneNode(true);
			if (scrollerRef.current) {
				scrollerRef.current.appendChild(duplicatedItem);
			}
		});

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setStart(true);
					}
				});
			},
			{ threshold: 0.1 },
		);

		observer.observe(containerRef.current);

		return () => {
			observer.disconnect();
		};
	}, [items]);

// ... rest of the code ...