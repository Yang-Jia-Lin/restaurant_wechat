// app.js
App({
	globalData: {
		// 用户信息
		userInfo: null, 
		isUserRegister: false,
		
		// 门店信息
		storeInfo: null,
		stores: [],
		
		// 用户位置信息
		latitude: 37.00,
		longitude: 112.00,
		
		// 订单信息
	  	serviceType: '到店',

	  	baseUrl: "https://forestlamb.online/restaurant/"
	}
});  