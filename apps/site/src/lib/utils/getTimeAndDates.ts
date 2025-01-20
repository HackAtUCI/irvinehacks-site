function getTimeAndDates(givenTime: Date) {
	const convertWeekdays = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const convertMonths = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sept",
		"Oct",
		"Nov",
		"Dec",
	];

	const currentHour = givenTime.getHours() % 12;
	const currentMinute = givenTime.getMinutes().toString().padStart(2, "0");
	const amPm = givenTime.getHours() < 12 ? "am" : "pm";
	const currentWeekDay = convertWeekdays[givenTime.getDay()];
	const currentDate = givenTime.getDate();
	const currentSecond = givenTime.getSeconds().toString().padStart(2, "0");
	const currentMonth = convertMonths[givenTime.getMonth()];

	return {
		hour: currentHour,
		date: currentDate,
		day: currentWeekDay,
		amPm: amPm,
		minute: currentMinute,
		second: currentSecond,
		month: currentMonth,
		compositeTimeHourMinute: `${currentHour}:${currentMinute}`,
	};
}

export default getTimeAndDates;
