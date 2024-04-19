const baseUrl = "https://forestlamb.online/restaurant/";

function fetchStores(latitude = 37.751915, longitude = 112.712555) {
	wx.showLoading({
		title: '请求门店信息',
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

function fetchTopBanner() {
	return new Promise((resolve, reject) => {
		wx.request({
			url: `${baseUrl}carousels/`,
			method: 'GET',
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data);
				} else {
					reject('获取门店失败，请重试');
				}
			},
			fail: () => {
				reject('获取门店信息失败');
			}
		});
	});
}

export {
	fetchStores,
	fetchTopBanner
};
