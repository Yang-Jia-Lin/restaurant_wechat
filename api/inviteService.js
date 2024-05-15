const baseUrl = "https://forestlamb.online/restaurant/";

function newInvite(inviter, invitee) {
	wx.showLoading({
		title: '加载中',
		mask: true
	})
	return new Promise((resovle, reject) => {
		wx.request({
			url: baseUrl + 'invite/create',
			method: 'POST',
			data: {
				inviterId: inviter,
				inviteeId: invitee
			},
			success: res => {
				console.log('创建分享中', res)
				if (res.statusCode == 200) {
					resovle(true)
				} else if (res.statusCode == 202) {
					resovle(false)
				} else {
					reject()
				}
			},
			fail: err => {
				reject(err)
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	})
}
function registerInvite(invitee) {
	wx.showLoading({
		title: '加载中',
		mask: true
	})
	return new Promise((resovle, reject) => {
		wx.request({
			url: baseUrl + 'invite/updateInviteStatus',
			method: 'POST',
			data: {
				inviteeId: invitee,
				status: 'registered'
			},
			success: res => {
				console.log('更新分享状态中', res)
				if (res.statusCode == 200) {
					resovle(true)
				} else if (res.statusCode == 202) {
					resovle(false)
				} else {
					reject()
				}
			},
			fail: err => {
				reject(err)
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	})
}
function payInvite(invitee) {
	wx.showLoading({
		title: '加载中',
		mask: true
	})
	return new Promise((resovle, reject) => {
		wx.request({
			url: baseUrl + 'invite/completeInvite',
			method: 'POST',
			data: {
				inviteeId: invitee,
				status: 'ordered'
			},
			success: res => {
				console.log('完成分享中', res)
				if (res.statusCode == 200) {
					resovle(true)
				} else if (res.statusCode == 202) {
					resovle(false)
				} else {
					reject()
				}
			},
			fail: err => {
				reject(err)
			},
			complete: () => {
				wx.hideLoading()
			}
		})
	})
}
export {
	newInvite,
	registerInvite,
	payInvite
};