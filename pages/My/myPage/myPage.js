import { getCurrentOrder } from '../../../api/orderService'
import { showError } from '../../../utils/tool';
const app = getApp();


Page({
    data: {
        statusBarHeight: app.globalData.toolBarHeight,
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
        getCurrentOrder(order_id).then(order => {
            this.setData({
                recentOrder: order,
                haveOrder: true
            })
        }).catch(err => {
            wx.setStorageSync('orderId', '');
            this.setData({
                haveOrder: false
            })
            showError("加载出现问题", err)
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
            url: '../../Order/allOrder/allOrder',
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