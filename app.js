import { userLogin } from '/api/userService';
import { fetchStore } from '/api/storeService';
import { showError } from '/utils/tool';
import { solvingTime } from '/utils/timeProc';

App({
	globalData: {
		baseUrl: "https://forestlamb.online/restaurant/",
		// 等待获取的信息
		userInfo: wx.getStorageSync('userInfo') || {
			avatar_url: "https://forestlamb.online/public/restaurant/icon/avatar.png",
			balance: 0,
			nickname: "临时用户",
			points: 0,
			user_id: 0
		},
		storeInfo: {
			store_name: '附近门店',
			business_hours: "09:00:00-14:00:00 16:00:00-21:30:00",
			business_status: "营业中",
			distance: 0.11,
			latitude: 37.750916,
			longitude: 112.712555,
			takeout_status: "可配送"
		},
		// 全局信息
		addressInfo: {},
		serviceType: '到店',
		toolBarHeight: wx.getSystemInfoSync().statusBarHeight
	},

	onLaunch() {
		this.getSetting()
		this.getUserInfo()
	},

	// 事件触发
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

	// 准备：获取位置授权和位置
	getSetting() {
		wx.getSetting({
			success: (res) => {
				if (!res.authSetting['scope.userLocation']) {
					wx.authorize({
						scope: 'scope.userLocation',
						success: () => {
							// 同意：获取位置
							this.getLocation();
						},
						fail: () => {
							// 不同意：直接获取默认门店
							this.getStores();
						}
					});
				} else {
					this.getStores();
				}
			}
		});
	},
	getLocation() {
		wx.getLocation({
			type: 'wgs84',
			success: (res) => {
				// 成功获取到位置，传入参数获取门店信息
				console.log('位置：', res.latitude, res.longitude);
				this.getStores(res.latitude, res.longitude);
			},
			fail: () => {
				// 没有获取到位置信息，使用默认位置获取门店信息
				showError("获取位置信息失败");
				this.getStores();
			}
		});
	},

	// 获取用户信息
	getUserInfo() {
		wx.login({
			success: res => {
				if (res.code) {
					userLogin(res.code).then(user => {
						console.log("用户信息：", user);
						this.globalData.userInfo = user;
						this.trigger('userInfoUpdated');
						wx.setStorageSync('userInfo', user);
					}).catch(error => {
						showError("获取用户失败", error);
					});
				} else {
					showError("获取code失败", res.errMsg);
				}
			},
			fail: () => {
				showError("微信登录失败");
			}
		});
	},

	// 获取默认门店信息
	getStores(latitude, longitude) {
		fetchStore(latitude, longitude).then(store => {
			console.log("门店信息：", store);
			this.globalData.storeInfo = store;
			this.trigger('storeInfoUpdated');
			solvingTime(store.store_id, store.last_updated)
		}).catch(error => {
			showError("获取门店信息失败", error);
		});
	}
});
