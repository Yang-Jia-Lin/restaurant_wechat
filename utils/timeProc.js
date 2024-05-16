import { fetchStoreTime } from '../api/storeService';

// 初始化
function solvingTime(storeId, newStamp) {
	console.log("重新获取时间信息")
	fetchStoreTime(storeId).then(store => {
		console.log("时间信息：", store.timeSlots);
		wx.setStorageSync('storeTime', store.timeSlots)
		wx.setStorageSync('timeStamp', store.lastUpdated)
	}).catch(error => {
		showError("获取时间信息失败", error);
	});
	// let timeStamp = wx.getStorageSync('timeStamp') || '';
	// if (!timeStamp || timeStamp !== newStamp) {
	// 	console.log("重新获取时间信息")
	// 	fetchStoreTime(storeId).then(store => {
	// 		console.log("时间信息：", store.timeSlots);
	// 		wx.setStorageSync('storeTime', store.timeSlots)
	// 		wx.setStorageSync('timeStamp', store.lastUpdated)
	// 	}).catch(error => {
	// 		showError("获取门店信息失败", error);
	// 	});
	// } else {
	// 	console.log("时间信息", wx.getStorageSync('storeTime'))
	// }
}


// 内部函数：时间解析和比较
function parseTime(time) {
	const [hours, minutes, seconds] = time.split(':').map(Number);
	const now = new Date();
	now.setHours(hours, minutes, seconds, 0);
	return now;
}
function getNow() {
	const now = new Date();
	//now.setHours(13, 41, 0, 0);
	return now;
}

// 立即取餐 [now, now+20]
function canTakeNow(timeSlots) {
	const now = getNow();
	const endTime = new Date(now.getTime());
	endTime.setMinutes(now.getMinutes() + 20);
	return timeSlots.some(slot => {
		const slotTime = parseTime(slot.time_slot);
		return slotTime >= now && slotTime <= endTime;
	});
}

// 预约取餐时间数组 [now, ∞)
function scheduleTakeSlots(timeSlots) {
	const now = getNow();
	const filteredSlots = timeSlots
		.filter(slot => parseTime(slot.time_slot) > now)
		.map(slot => slot.time_slot.slice(0, 5));
	return filteredSlots.length === 0 ? ['暂无可用时间'] : filteredSlots;
}

// 立即送餐 [now+20, now+40] && aviliable
function canDeliverNow(timeSlots) {
	const now = getNow();
	const beginTime = new Date(now.getTime());
	const endTime = new Date(now.getTime());
	beginTime.setMinutes(now.getMinutes() + 20);
	endTime.setMinutes(now.getMinutes() + 40);
	return timeSlots.some(slot => {
		const slotTime = parseTime(slot.time_slot);
		return slotTime >= beginTime && slotTime <= endTime && slot.time_status === 'available';
	});
}

// 预约送餐时间数组 [now+30, ∞) && aviliable
function scheduleDeliverySlots(timeSlots) {
	const now = getNow();
	now.setMinutes(now.getMinutes() + 30);
	const filteredSlots = timeSlots
		.filter(slot => parseTime(slot.time_slot) >= now && slot.time_status === 'available')
		.map(slot => slot.time_slot.slice(0, 5));
	return filteredSlots.length === 0 ? ['暂无可用时间'] : filteredSlots;
}

// 测试时间判断
function testTimeFunctions(timeSlots) {
	console.log("是否可以立即取餐：", canTakeNow(timeSlots));
	console.log("预约取餐时间：", scheduleTakeSlots(timeSlots));
	console.log("是否可以立即送餐：", canDeliverNow(timeSlots));
	console.log("预约送餐时间：", scheduleDeliverySlots(timeSlots));
}

// 转换字符串时间为Date
function getDeliveryDate(type, time) {
	if (type == '立即')
		return new Date()
	else {
		const currentDate = new Date();
		const [hours, minutes] = time.split(':').map(Number);
		currentDate.setHours(hours, minutes, 0, 0);
		return currentDate;
	}
}

// 比较是否是今天
function areSameDay(date) {
	const today = new Date()
	const orderDay = new Date(date)
	const sameYear = orderDay.getFullYear() === today.getFullYear();
	const sameMonth = orderDay.getMonth() === today.getMonth();
	const sameDay = orderDay.getDate() === today.getDate();
	return sameYear && sameMonth && sameDay;
}

export {
	solvingTime,
	testTimeFunctions,
	canTakeNow,
	scheduleTakeSlots,
	canDeliverNow,
	scheduleDeliverySlots,
	getDeliveryDate,
	areSameDay
};