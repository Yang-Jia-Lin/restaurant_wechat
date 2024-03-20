// app.js
App({
	globalData: {
		baseUrl: "https://forestlamb.online/restaurant/",
		userInfo:  wx.getStorageSync('userInfo') || {},
		storeInfo: {store_name: '附近门店'},
		addressInfo: {},
		serviceType: '到店',
	},

	onLaunch() {
		this.getSetting()
		this.getUserInfo()
	},

	// 自定义事件触发
	eventHandler: {},
    on(event, callback) {
        if (!this.eventHandler[event]) {
            this.eventHandler[event] = [];
        }
        this.eventHandler[event].push(callback);
    },
    trigger(event, ...args) {
        if (this.eventHandler[event]) {
            this.eventHandler[event].forEach(callback => {
                callback(...args);
            });
        }
    },
    off(event, callback) {
        if (this.eventHandler[event]) {
            const index = this.eventHandler[event].indexOf(callback);
            if (index > -1) {
                this.eventHandler[event].splice(index, 1);
            }
        }
    },

	// 1.获取授权
	getSetting() {
		wx.getSetting({
			success: (res) => {
				if (!res.authSetting['scope.userLocation']) {
					wx.authorize({
						scope: 'scope.userLocation',
						success: () => {
							this.getLocation();
						},
						fail: () => {
							this.getStores();
						}
					});
				} else {
					this.getStores();
				}
			}
		});
	},
	// 2.获取位置信息
	getLocation() {
		wx.getLocation({
			type: 'wgs84',
			success: (res) => {
				console.log('位置', res.latitude, res.longitude);
				this.getStores(res.latitude, res.longitude);
			},
			fail: () => {
				console.log("获取位置信息失败");
				this.getStores();
			}
		});
	},
	// 3.获取门店信息
	getStores(latitude, longitude) {
		if (!latitude || !longitude) {
			latitude = 37.751915
			longitude = 112.712555
		}
		wx.request({
			url: this.globalData.baseUrl + 'stores/',
			method: 'GET',
			data: {
				latitude: latitude,
				longitude: longitude,
			},
			success: (res) => {
				console.log('获取门店信息', res);
				if (res.data.success) {
					this.globalData.storeInfo = res.data.stores[0];
					this.trigger('storeInfoUpdated'); // 触发事件
				} else {
					wx.showToast({
						title: '获取门店失败，请重试',
					})
				}
			},
			fail: (err) => {
				console.log('获取门店信息失败', err);
				wx.showToast({
					title: '获取门店失败，请重试',
				})
			}
		});
	},

	// 获取用户信息
    getUserInfo() {
        wx.login({
            success: res => {
                if (res.code) {
                    wx.request({
                        url: this.globalData.baseUrl+'users/login',
                        method: 'POST',
                        data: { code: res.code },
                        success: (res) => {
							console.log('获取用户信息', res)
                            if (res.data.success) {
								this.globalData.userInfo = res.data.user
								this.trigger('userInfoUpdated'); 
								wx.setStorageSync('userInfo', res.data.user);
                            } else {
                                console.error('服务器获取用户信息失败');
                            }
                        },
                        fail: () => {
                            console.error('请求服务器失败');
                        }
                    });
                } else {
                    console.error('获取code失败: ' + res.errMsg);
                }
            },
            fail: () => {
                console.error('微信登录失败');
            }
        });
    },

});