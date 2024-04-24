const baseUrl = "https://forestlamb.online/restaurant/";

// =========================用户======================
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


// =========================门店=======================
// 门店订单获取
function getStoreOrder(storeId, status) {
	// 显示加载提示
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: `${baseUrl}orders/admin/store/${storeId}/status/${status}`,
			method: 'GET',
			success: (res) => {
				if (res.statusCode === 200) {
					let list = res.data
					list.forEach(order => {
						if (order.orderDetails && Array.isArray(order.orderDetails)) {
							order.orderDetails.forEach(detail => {
								detail.dish_name_short = detail.dish_name.substring(0, 3);
							});
						}
					});
					resolve(list)
				} else {
					reject('获取订单失败')
				}
			},
			fail: (error) => {
				reject(error)
			},
			complete: () => {
				wx.hideLoading()
			}
		});
	})
}
function getStoreOrderNumber(storeId) {
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'orders/admin/store/' + storeId + '/statuses/',
			method: 'POST',
			data: {
				statuses: ['制作中', '等待中', '配送中']
			},
			success: (res) => {
				if (res.statusCode === 200) {
					const result = {
						n1: res.data['制作中'],
						n2: res.data['等待中'],
						n3: res.data['配送中'],
					}
					resolve(result)
				} else {
					reject('请求数量失败')
				}
			},
			fail: (error) => {
				reject(error)
			},
			complete: () => {
				wx.hideLoading()
			}
		});
	})
}
function getAllOrder() {
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'orders/admin/super/status/',
			method: 'GET',
			success: (res) => {
				console.log("获取订单", res.data);
				if (res.statusCode === 200) {
					let list = res.data
					list.forEach(order => {
						if (order.orderDetails && Array.isArray(order.orderDetails)) {
							order.orderDetails.forEach(detail => {
								detail.dish_name_short = detail.dish_name.substring(0, 3);
							});
						}
					});
					resolve(list)
				} else {
					reject('获取订单失败')
				}
			},
			fail: (error) => {
				reject(error)
			},
			complete: () => {
				wx.hideLoading();
			}
		});
	})
}
function updateOrderStatus(orderId, status) {
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'orders/' + orderId + '/status',
			method: 'PATCH',
			data: {
				status: status
			},
			success: (res) => {
				if (res.statusCode === 200) {
					resolve()
				} else {
					reject()
				}
			},
			fail: () => {
				reject()
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	})
}


// ===========================其他========================
// 开始制作
function beginMakeOrder(orderId) {
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'orders/' + orderId + '/begin-make',
			method: 'PATCH',
			success: (res) => {
				if (res.statusCode === 200) {
					resolve()
				} else {
					reject()
				}
			},
			fail: () => {
				reject()
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	})
}

export {
	getUserAllOrder,
	getCurrentOrder,
	getStoreOrder,
	getStoreOrderNumber,
	getAllOrder,
	updateOrderStatus,
	beginMakeOrder
};