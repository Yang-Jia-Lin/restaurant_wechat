import { fetchStoreTime } from '../api/storeService';

// 初始化时间
function solvingTime(storeId, newStamp) {
	let timeStamp = wx.getStorageSync('timeStamp') || '';
	if (!timeStamp || timeStamp !== newStamp) {
		console.log("重新获取时间信息")
		fetchStoreTime(storeId).then(store => {
			console.log("时间信息：", store.timeSlots);
			wx.setStorageSync('storeTime', store.timeSlots)
			wx.setStorageSync('timeStamp', store.lastUpdated)
		}).catch(error => {
			showError("获取门店信息失败", error);
		});
	}
}

export {
	solvingTime
};