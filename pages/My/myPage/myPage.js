const app = getApp();

Page({
    data: {
        statusBarHeight: app.globalData.toolBarHeight,
        userInfo: app.globalData.userInfo,
    },
    onLoad() {
        app.on('userInfoUpdated', this.updateInfo);
        this.setData({
            userInfo: app.globalData.userInfo
        })
    },
    onUnload() {
        app.off('userInfoUpdated', this.updateInfo);
    },
    updateInfo() {
        this.setData({
            userInfo: app.globalData.userInfo
        });
    },
    onShareAppMessage: function () {
        return {
            title: '唐合丰面馆，一家独特的重庆拌面馆，快来尝尝吧！',
            path: '/pages/Home/home/home'
        }
    },
    onPullDownRefresh() {
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
        this.setData({
            userInfo: app.globalData.userInfo
        })
    },


    // 会员中心
    goToRegister() {
        wx.navigateTo({
            url: '/pages/My/register/register',
        })
    },
    goToTopUp() {
        wx.showModal({
            title: '提示',
            content: '抱歉，功能开发中，敬请期待！',
            showCancel: false,
        })
    },
    goToRedeem() {
        wx.showModal({
            title: '提示',
            content: '抱歉，功能开发中，敬请期待！',
            showCancel: false,
            success: () => {
                return
            }
        })
        // wx.navigateTo({
        //     url: '/pages/My/redeem/redeem',
        // })
    },
    goToPoints() {
        wx.navigateTo({
            url: '/pages/My/points/points',
        })
    },
    goToCoupon() {
        wx.showModal({
            title: '提示',
            content: '抱歉，功能开发中，敬请期待！',
            showCancel: false,
            success: () => {
                return
            }
        })
        // wx.navigateTo({
        //     url: '/pages/My/coupon/coupon',
        // })
    },


    // 我的服务
    goToMyOrder() {
        wx.navigateTo({
            url: '/pages/Order/allOrder/allOrder',
        })
    },
    contact_us() {
        wx.navigateTo({
            url: '/pages/My/contact/contact',
        })
    },
    goToMore() {
        wx.navigateTo({
            url: '/pages/My/more/more',
        })
    },
    goToAdmin() {
        wx.navigateTo({
            url: '/pages/Admin/adminHome/adminHome',
        })
    }
})