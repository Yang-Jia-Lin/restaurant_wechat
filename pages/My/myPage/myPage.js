const app = getApp();
const baseUrl = app.globalData.baseUrl

Page({
    data: {
        userInfo: app.globalData.userInfo,
        recentOrder: {},
        haveOrder: false,
    },
    onShareAppMessage: function () {
        return {
            title: '唐合丰面馆，一家独特的重庆拌面馆，快来尝尝吧！',
            path: '/pages/Home/home/home'
        }
    },
    onShow() {
        this.setData({
            userInfo: app.globalData.userInfo
        })
        let order_id = wx.getStorageSync('orderId') || ''
        if (order_id !== '') {
            this.getRecentOrder(order_id);
        }
    },
    onRefresh() {
        //导航条加载动画
        wx.showNavigationBarLoading()
        //loading 提示框
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        setTimeout(function () {
            wx.hideLoading();
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh();
        }, 1000)
        this.onShow();
    },
    onPullDownRefresh() {
        this.onRefresh();
    },
    onLoad() {
        app.on('userInfoUpdated', this.updateInfo);
    },
    onUnload() {
        app.off('userInfoUpdated', this.updateInfo);
    },
    updateInfo() {
        this.setData({
            userInfo: app.globalData.userInfo
        });
    },

    getRecentOrder(order_id) {
        wx.request({
            url: baseUrl + 'orders/user/details/' + order_id,
            method: 'GET',
            success: (res) => {
                console.log(res);
                if (res.statusCode == 200 && res.data.order_status != '待支付') {
                    this.setData({
                        recentOrder: res.data,
                        haveOrder: true
                    })
                } else {
                    this.setData({
                        haveOrder: false
                    })
                    wx.setStorageSync('orderId', '')
                }
            },
            fail: (err) => {
                console.error(err)
                wx.setStorageSync('orderId', '')
                this.setData({
                    haveOrder: false
                })
            }
        })
    },


    // 页面跳转
    goToRegister() {
        wx.navigateTo({
            url: '/pages/My/register/register',
        })
    },
    goToMyOrder() {
        wx.navigateTo({
            url: '../../My/myOrder/myOrder',
        })
    },
    contact_us() {
        wx.navigateTo({
            url: '../../My/contact/contact',
        })
    },
    goToAdmin() {
        wx.navigateTo({
            url: '../../Admin/adminHome/adminHome',
        })
    }
})