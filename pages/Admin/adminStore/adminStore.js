let app = getApp();
let baseUrl = app.globalData.baseUrl
let windowHeight = 0

Page({
	data: {
		// 营业状态
		business_status: '营业中',
		takeout_status: '可配送',

		// 菜品状态
		menuArrIn: [],
		menuArrOut: [],

		// 打印机状态
		shouldPrint: false
	},

	// 初始化各个状态
	onLoad() {
		this.getStoreInfo()
		this.getFoodList()
		this.getPrintingPreference()
	},
	getStoreInfo() {
		wx.request({
			url: baseUrl + 'stores/1',
			method: 'GET',
			success: (res) => {
				const store = res.data.store
				if (res.data.success) {
					this.setData({
						business_status: store.business_status,
						takeout_status: store.takeout_status
					})
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
	getFoodList() {
		let menuArrIn = []; // 到店菜品数组
		let menuArrOut = []; // 外卖菜品数组
		wx.request({
			url: baseUrl + 'dishes/store-dishes/',
			method: 'GET',
			data: {
				storeId: 1,
			},
			success: res => {
				if (res.data.success) {
					console.log('菜品数据获取成功', res.data);
					const storeDishes = res.data.storeDishes;
					storeDishes.forEach(dish => {
						if (dish.serviceType === '到店') {
							menuArrIn.push(dish);
						} else if (dish.serviceType === '外卖') {
							menuArrOut.push(dish);
						}
					});
					this.setData({
						menuArrIn: menuArrIn,
						menuArrOut: menuArrOut
					})
				} else {
					console.error("菜品数据请求失败", res);
				}
			},
			fail: error => {
				console.error("菜品数据请求失败", error);
			}
		});
	},
	getPrintingPreference: function () {
		wx.request({
			url: baseUrl + 'setPrinter/get', // 替换为实际的后端接口地址
			method: 'GET',
			success: (res) => {
				if (res.data.success) {
					console.log('获取打印机状态成功', res.data)
					this.setData({
						shouldPrint: res.data.shouldPrint,
					});
				} else {
					console.log('获取打印设置失败');
				}
			},
			fail: () => {
				console.log('请求失败');
			}
		});
	},



	// 修改门店状态
	onServiceTypeChange(e) {
		console.log(e.currentTarget.dataset)
		if (e.currentTarget.dataset.bstatus) {
			this.changeServiceStatus("business_status", e.currentTarget.dataset.bstatus)
		} else {
			this.changeServiceStatus("takeout_status", e.currentTarget.dataset.tstatus)
		}

	},
	changeServiceStatus(target, status) {
		let data = {};
		data[target] = status;
		wx.request({
			url: baseUrl + 'stores/1',
			method: 'PUT',
			data: data,
			success: (res) => {
				console.log(res.data.updatedStore)
				if (res.data.success) {
					this.setData({
						business_status: res.data.updatedStore.business_status,
						takeout_status: res.data.updatedStore.takeout_status
					})
				} else {
					wx.showToast({
						title: '更新门店状态失败，请重试',
						icon: 'none',
					});
				}
			},
			fail: (err) => {
				console.log('更新门店状态失败', err);
				wx.showToast({
					title: '更新门店失败，请重试',
					icon: 'none',
				});
			}
		});
	},

	// 修改菜品状态
	goUpDish(e) {
		const dish_id = e.currentTarget.dataset.id;
		const serviceType = e.currentTarget.dataset.type;
		const status = e.currentTarget.dataset.status;
		wx.request({
			url: `${baseUrl}dishes/status/1/${dish_id}/${serviceType}`,
			data: {
				dish_status: status
			},
			method: 'PUT',
			success: (res) => {
				console.log(res)
				this.getFoodList()
			},
			fail: (err) => {
				console.error(err)
			}
		})
	},

	// 修改打印机状态
	onSwitchChange: function (e) {
		const newShouldPrint = e.detail.value;
		wx.request({
			url: baseUrl + 'setPrinter/set',
			method: 'POST',
			data: {
				shouldPrint: newShouldPrint,
			},
			success: (res) => {
				if (res.data.success) {
					console.log('修改打印机状态成功', res.data)
					this.setData({
						shouldPrint: newShouldPrint,
					});
				} else {
					console.log('设置打印偏好失败');
				}
			},
			fail: () => {
				// 请求失败的处理
				console.log('请求失败');
			}
		});
	},

})