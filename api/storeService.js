const baseUrl = "https://forestlamb.online/restaurant/";

// 获取默认门店
function fetchStore(latitude = 37.751915, longitude = 112.712555) {
	wx.showLoading({
		title: '获取门店信息中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: `${baseUrl}stores/`,
			method: 'GET',
			data: {
				latitude,
				longitude
			},
			success: (res) => {
				wx.hideLoading();
				if (res.data.success) {
					resolve(res.data.stores[0]);
				} else {
					reject('获取门店失败，请重试');
				}
			},
			fail: (err) => {
				wx.hideLoading();
				reject('获取门店信息失败');
			}
		});
	});
}
function fetchStoreTime(storeId) {
	return new Promise((resolve, reject) => {
		wx.request({
			url: `${baseUrl}stores/${storeId}/timeSlots`,
			method: 'GET',
			success: (res) => {
				if (res.data.success) {
					const { lastUpdated, timeSlots } = res.data;
					resolve({ lastUpdated, timeSlots });
				} else {
					reject(res.data.message || '获取门店时间信息失败，请重试');
				}
			},
			fail: (err) => {
				console.error('Error making the request:', err);
				reject('网络请求失败，请检查网络连接');
			}
		});
	});
}

// 获取所有门店
function fetchAllStores(latitude = 37.75191, longitude = 112.71255) {
	wx.showLoading({
		title: '获取门店信息中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: `${baseUrl}stores/`,
			method: 'GET',
			data: {
				latitude,
				longitude
			},
			success: (res) => {
				wx.hideLoading();
				if (res.data.success) {
					resolve(res.data.stores);
				} else {
					reject('获取门店失败，请重试');
				}
			},
			fail: () => {
				wx.hideLoading();
				reject('获取门店信息失败');
			}
		});
	});
}

// 获取轮播图
function fetchTopBanner() {
	return new Promise((resolve, reject) => {
		wx.request({
			url: `${baseUrl}carousels/`,
			method: 'GET',
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data);
				} else {
					reject('获取轮播图失败，请重试');
				}
			},
			fail: () => {
				reject('获取轮播图失败');
			}
		});
	});
}

export {
	fetchStore,
	fetchStoreTime,
	fetchAllStores,
	fetchTopBanner
};
