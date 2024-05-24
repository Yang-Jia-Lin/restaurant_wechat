import { toFloat } from '../utils/tool';
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
					console.log('全部订单:', res.data);
					resolve(res.data)
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
					let order = res.data;
					order.total_price = toFloat(order.total_price, 2);
					order.points = toFloat(order.points, 2)
					console.log('最近订单', order)
					resolve(order);
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
function changeDeliverTime(orderId, deliverTime) {
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'orders/user/changeTime/',
			method: 'POST',
			data: {
				orderId,
				deliverTime
			},
			success: (res) => {
				if (res.data.success) {
					resolve(res.data.order)
				} else {
					reject(res.data.message)
				}
			},
			fail: (error) => {
				reject(error.message)
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	})
}
function getQueueNum(pickup_id) {
	wx.showLoading({
		title: '加载中',
		mask: true
	});
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'orders/user/queueNum/' + pickup_id,
			method: 'GET',
			success: (res) => {
				if (res.data.success) {
					resolve(res.data.number)
				} else {
					reject(res.data.message)
				}
			},
			fail: (error) => {
				reject(error.message)
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
		});
	})
}
function getStoreOrderNumber(storeId) {
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
				console.log('premake', res)
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
function addSales(dishIds) {
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'dishes/sales/increment',
			method: 'PUT',
			data: {
				dishIds: dishIds
			},
			complete: () => {
				resolve();  // 确保调用 resolve 以完成 Promise
			},
			fail: (error) => {
				reject(error);  // 如果请求失败，调用 reject
			}
		})
	});
}
function addPoints(user_id, pointsNum, issue) {
	wx.showLoading({
		title: '加载中',
		mask: true
	})
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'points/add/' + user_id,
			method: 'PUT',
			data: {
				pointsToAdd: pointsNum,
				issueType: issue
			},
			success: (res) => {
				if (res.data.success) {
					console.log('积点增加后：', res.data.updatedUser);
					let user = res.data.updatedUser;
					user.points = toFloat(user.points, 2);
					user.balance = toFloat(user.balance, 2);
					resolve(user)
				} else {
					reject(res.errMsg)
				}
			},
			fail: (err) => {
				reject(err)
			},
			complete: () => {
				wx.hideLoading()
			}
		});
	})
}

export {
	getUserAllOrder,
	getCurrentOrder,
	getStoreOrder,
	getStoreOrderNumber,
	getAllOrder,
	updateOrderStatus,
	beginMakeOrder,
	changeDeliverTime,
	getQueueNum,
	addSales,
	addPoints
};