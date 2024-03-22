let app = getApp();
let baseUrl = app.globalData.baseUrl

Page({
    data: {
		business_status: app.globalData.storeInfo.business_status,
		takeout_status: app.globalData.storeInfo.takeout_status
    },

    onLoad(options) {
		console.log(this.data.business_status,this.data.takeout_status)
    },

    onShow() {

    },

    onShareAppMessage() {

    }
})