import { toFloat } from '../utils/tool';
const baseUrl = "https://forestlamb.online/restaurant/";

// 登录
function userLogin(code) {
	wx.showLoading({
		title: '登录中',
	})
	return new Promise((resolve, reject) => {
		wx.request({
			url: `${baseUrl}users/login`,
			method: 'POST',
			data: {
				code
			},
			success: (res) => {
				if (res.data.success) {
					let user = res.data.user;
					user.points = toFloat(user.points, 2);
					user.balance = toFloat(user.balance, 2);
					resolve(user);
				} else {
					reject('获取用户失败');
				}
			},
			fail: () => {
				reject('获取用户失败');
			},
			complete: () => {
				wx.hideLoading()
			}
		});
	});
}

// 解密手机号
function encryptPhone(code, encryptedData, iv) {
	wx.showLoading({
		title: '加载中',
	})
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'users/phone',
			method: 'POST',
			data: {
				code: code,
				encryptedData: encryptedData,
				iv: iv
			},
			success: (res) => {
				if (res.data.success) {
					resolve(res.data.data.phoneNumber)
				} else {
					reject(res.data.message)
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

// 注册
function userSignUp(user_id, phone, nickname, avatar) {
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'users/' + user_id,
			method: 'PUT',
			data: {
				phone_number: phone,
				nickname: nickname,
				avatar_url: avatar,
			},
			success: (res) => {
				if (res.statusCode === 200) {
					let user = res.data.updatedUser;
					user.points = toFloat(user.points, 2);
					user.balance = toFloat(user.balance, 2);
					resolve(user);
				} else {
					reject(res.errMsg)
				}
			},
			fail: (err) => {
				reject(err)
			}
		});
	})
}

// 获取可用外送地址
function getAddress() {
	return new Promise((resovle, reject) => {
		wx.request({
			url: `${baseUrl}address/`,
			success: (res) => {
				if (res.statusCode == 200) {
					const addresses = res.data.map(item => item.address_value)
					resovle(addresses);
				} else {
					reject('获取地址失败');
				}
			},
			fail: () => {
				reject('获取地址失败');
			}
		});
	})
}

// 查询积点明细
function getPointDetail(userId) {
	wx.showLoading({
		title: '加载中',
		mask: true
	})
	return new Promise((resolve, reject) => {
		wx.request({
			url: baseUrl + 'points/details/' + userId,
			method: 'GET',
			success: (res) => {
				if (res.data.success) {
					let points = res.data.points
					points.forEach(point => {
						point.amount = toFloat(point.amount, 2);
					});
					console.log('积点明细：', points);
					resolve(points)
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
	userLogin,
	encryptPhone,
	userSignUp,
	getAddress,
	getPointDetail
};