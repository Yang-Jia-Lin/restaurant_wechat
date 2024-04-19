const baseUrl = "https://forestlamb.online/restaurant/";

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
					resolve(res.data.user);
				} else {
					reject('服务器获取用户信息失败');
				}
			},
			fail: reject
		});
	});
}

export {
	userLogin
};