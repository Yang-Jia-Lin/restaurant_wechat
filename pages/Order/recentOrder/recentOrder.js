import { getCurrentOrder } from '../../../api/orderService'
import { showError } from '../../../utils/tool';

Page({
    data: {
        recentOrder: {},
        haveOrder: false,
    },
    onShow() {
        let order_id = wx.getStorageSync('orderId') || ''
        if (order_id !== '') {
            this.getRecentOrder(order_id);
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
        this.onShow();
    },

    // 获取最近订单
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
})