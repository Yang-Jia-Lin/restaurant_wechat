let app = getApp()
const baseUrl = app.globalData.baseUrl

Page({
    data: {
        list: [],
    },

    onShow: function () {
        this.getOrderListAll();
    },
    onRefresh: function () {
        wx.showNavigationBarLoading()
        wx.showLoading({
            title: 'Loading...',
        })
        setTimeout(function () {
            wx.hideLoading();
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh();
        }, 1000)
        this.getOrderListAll();
    },
    onPullDownRefresh: function () {
        this.onRefresh();
    },

    // 获取全部订单
    getOrderListAll() {
        wx.request({
            url: baseUrl + 'orders/admin/super/status/',
            method: 'GET',
            success: (res) => {
                console.log("获取订单", res.data);
                if (res.statusCode === 200) {
                    this.setData({
                        list: res.data
                    })
                } else {
                    console.error("获取订单失败", res);
                }
            },
            fail: (error) => {
                console.error("请求订单失败", error);
            }
        });
    },

    makeCall(e) {
        console.log(e)
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        })
    },
})