import { getAllOrder } from './../../../api/orderService';
import { showError } from './../../../utils/tool';

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
            title: '加载中',
            mask: true
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
        getAllOrder().then(list => {
            this.setData({
                list: list
            })
        }).catch(err => {
            showError('获取订单失败', err)
        })
    },

    makeCall(e) {
        console.log(e)
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        })
    },
})