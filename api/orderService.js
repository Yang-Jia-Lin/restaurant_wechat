const baseUrl = "https://forestlamb.online/restaurant/";

// 用户获取全部订单
function getUserAllOrder(userId) {
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'orders/user/' + userId,
			method: 'GET',
			success: (res) => {
				if (res.statusCode === 200) {
					const groupedOrders = res.data.reduce((acc, order) => {
						if (!acc[order.order_status]) {
							acc[order.order_status] = [];
						}
						acc[order.order_status].push(order);
						return acc;
					}, {});

					const result = {
						allOrders: res.data,
						groupOrders: groupedOrders
					}
					resolve(result)
				} else {
					reject('获取订单失败')
				}
			},
			fail: (err) => {
				reject(err.errMsg)
			},
			complete: () => {
				wx.hideLoading();
			}
		});
	})
}
// 用户获取当前订单
function getCurrentOrder(order_id) {
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'orders/user/details/' + order_id,
			method: 'GET',
			success: (res) => {
				if (res.statusCode == 200 && res.data.order_status != '待支付') {
					resolve(res.data);
				} else {
					reject('订单不存在')
				}
			},
			fail: (err) => {
				reject(err)
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	})
}

// 门店全部订单
function getStoreOrder(userId) {
	// 显示加载提示
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'dishes/store-dishes/',
			method: 'GET',
			data: {
				storeId: storeId,
				serviceType: serviceType,
				dish_status: dish_status
			},
			success: res => {
				if (res.data.success) {

					resolve(data);
				} else {
					reject("订单请求失败")
				}
			},
			fail: error => {
				reject("订单请求失败", error)
			},
			complete: () => {
				wx.hideLoading();
			}
		});
	})
}


export {
	getUserAllOrder,
	getCurrentOrder
};