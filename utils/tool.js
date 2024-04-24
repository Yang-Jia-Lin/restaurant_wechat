function toFloat(numberString, fixedNum = 2) {
	let num = parseFloat(numberString).toFixed(fixedNum);
	return +num;
}

function showError(title, error = null) {
	if (error) {
		console.error(title, error);
	} else {
		console.log(title);
	}
	wx.showToast({
		title: title,
		icon: "error",
		duration: 3000
	})
}

function generateOptions(startTime, endTime) {
	let options = [];
	// 格式化时间
	const startDate = new Date(`2024-01-01T${startTime}`);
	const endDate = new Date(`2024-01-01T${endTime}`);
	// 将startTime调整到最近的20分钟间隔
	const startMinutes = startDate.getMinutes();
	const additionalMinutes = 20 - (startMinutes % 20);
	startDate.setMinutes(startMinutes + additionalMinutes);
	// 生成时间选项
	while (startDate <= endDate) {
		const hours = startDate.getHours();
		const minutes = startDate.getMinutes();
		const timeString = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
		options.push(timeString);
		startDate.setMinutes(startDate.getMinutes() + 20);
	}
	return options;
}
function convertToDateTime(timeStr) {
	// 获取当前日期
	const now = new Date();

	// 分解字符串为小时和分钟
	const parts = timeStr.split(':');
	const hours = parseInt(parts[0], 10);
	const minutes = parseInt(parts[1], 10);

	// 设置小时和分钟
	now.setHours(hours, minutes, 0, 0); // 设置秒和毫秒为0

	return now;
}
function getCurrentHourMinutes() {
	const now = new Date();
	// now.setHours(7,0,0,0);
	return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
}
function timeToMinutes(time) {
	const [hours, minutes] = time.split(":");
	return parseInt(hours) * 60 + parseInt(minutes);
}
function isWithinPeriod(start, end, current) {
	const startMinutes = timeToMinutes(start);
	const endMinutes = timeToMinutes(end);
	const currentMinutes = timeToMinutes(current);
	return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export {
	toFloat,
	showError,
	generateOptions,
	convertToDateTime,
	getCurrentHourMinutes,
	isWithinPeriod
};