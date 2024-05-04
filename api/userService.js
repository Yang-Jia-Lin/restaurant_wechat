import { toFloat } from '../utils/tool';
const baseUrl = "https://forestlamb.online/restaurant/";

// 登录
function userLogin(code) {
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
			}
		});
	});
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

export {
	userLogin,
	getAddress
};