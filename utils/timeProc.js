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
	//now.setHours(13, 40, 0, 0);
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
	return timeSlots
		.filter(slot => parseTime(slot.time_slot) > now)
		.map(slot => slot.time_slot.slice(0, 5));  // 提取时间字符串并格式化为 "hh:mm"
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
	return timeSlots
		.filter(slot => parseTime(slot.time_slot) >= now && slot.time_status === 'available')
		.map(slot => slot.time_slot.slice(0, 5));  // 提取并返回时间字符串数组
}

// 更新各功能的时间判断
function updateTimeFunctions(timeSlots) {
	console.log("是否可以立即取餐：", canTakeNow(timeSlots));
	console.log("预约取餐时间：", scheduleTakeSlots(timeSlots));
	console.log("是否可以立即送餐：", canDeliverNow(timeSlots));
	console.log("预约送餐时间：", scheduleDeliverySlots(timeSlots));
}

export {
	solvingTime,
	updateTimeFunctions
};