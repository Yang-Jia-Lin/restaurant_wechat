// app.js
App({
	globalData: {
		// 用户信息
		userInfo: null,
		isUserRegister: false,

		// 门店信息
		storeInfo: {
			address: "山西省晋中市太原师范学院启辰餐厅1层33号窗口",
			announcement: "欢迎光临，我们提供最新鲜的食材和最美味的菜肴。",
			business_hours: "09:00:00-14:00:00 16:30-21:00:00",
			business_status: "营业中",
			createdAt: "2024-02-19T08:23:24.000Z",
			distance: 104.57635152104082,
			latitude: 37.750916,
			longitude: 112.712555,
			phone: "15934101600",
			store_id: 1,
			store_image: "https://www.forestlamb.online/public/restaurant/stores/1.png",
			store_name: "太原师范学院店",
			takeout_status: "可配送",
			takeout_stop_begin1: "11:30:00",
			takeout_stop_begin2: "18:00:00",
			takeout_stop_end1: "12:20:00",
			takeout_stop_end2: "19:00:00",
		},
		stores: [],

		// 用户位置信息
		latitude: 37.751915,
		longitude: 112.712555,

		// 订单信息
		serviceType: '到店',
		addressInfo: null,

		baseUrl: "https://forestlamb.online/restaurant/"
	}
});