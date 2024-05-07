import {
    getStoreOrder,
    getStoreOrderNumber,
    updateOrderStatus,
    beginMakeOrder
} from './../../../api/orderService';
import { showError } from './../../../utils/tool';

const app = getApp();
const baseUrl = app.globalData.baseUrl;

Page({
    data: {
        navbar: ["待煮面", "待制作", "等待中", "待配送"],
        number1: 0,
        number2: 0,
        number3: 0,
        currentTab: 0,

        list: [],
        status: '制作中',

        noodles_flag: true
    },


    onShow: function () {
        this.getOrderListAll();
        this.getOrderList();
    },
    onLoad: function () {
        this.startPolling(); // 启动定时器
    },
    onUnload: function () {
        this.stopPolling(); // 页面卸载时停止定时器
    },


    // 获取订单（定时）
    startPolling: function () {
        this.pollingTimer = setInterval(() => {
            this.getOrderListAll();
            this.getOrderList();
        }, 30000);
    },
    stopPolling: function () {
        clearInterval(this.pollingTimer);
    },


    // 下拉刷新
    onRefresh: function () {
        // 导航条加载动画
        wx.showNavigationBarLoading()
        // loading 提示框
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
        this.getOrderList();
    },
    onPullDownRefresh: function () {
        this.onRefresh();
    },


    //顶部tab切换
    navbarTap(e) {
        let index = e.currentTarget.dataset.idx;
        this.setData({
            currentTab: index
        })
        if (index == 0) {
            this.setData({
                status: '制作中',
                noodles_flag: true
            })
        } else if (index == 1) {
            this.setData({
                status: '制作中',
                noodles_flag: false
            })
        } else if (index == 2) {
            this.setData({
                status: '等待中',
                noodles_flag: false
            })
        } else {
            this.setData({
                status: '配送中',
                noodles_flag: false
            })
        }
        this.getOrderList()
    },
    // 获取订单页面数据
    getOrderList() {
        getStoreOrder(1, this.data.status).then(list => {
            this.setData({
                list: list
            })
        }).catch(err => {
            showError('获取订单失败', err)
        })
    },
    getOrderListAll() {
        getStoreOrderNumber(1).then(({ n1, n2, n3 }) => {
            this.setData({
                number1: n1,
                number2: n2,
                number3: n3
            })
        }).catch(err => {
            showError('获取数量失败', err)
        })
    },

    // 修改状态
    // 点击完成制作
    madeClick(e) {
        const order = e.currentTarget.dataset.order
        const order_id = order.order_id
        const status = order.order_type == '外卖' ? '配送中' : '已完成'
        updateOrderStatus(order_id, status).then(() => {
            wx.showToast({
                title: '修改成功',
            });
            this.getOrderListAll();
            this.getOrderList();
        }).catch(err => {
            wx.showToast({
                icon: 'none',
                title: '提交失败',
            });
            showError('修改状态失败', err)
        })
    },
    // 点击配送完成
    takeOutClick(e) {
        const order_id = e.currentTarget.dataset.id
        const status = '已完成'
        updateOrderStatus(order_id, status).then(() => {
            wx.showToast({
                title: '修改成功',
            });
            this.getOrderListAll();
            this.getOrderList();
        }).catch(err => {
            wx.showToast({
                icon: 'none',
                title: '提交失败',
            });
            showError('修改状态失败', err)
        })
    },
    // 点击提前制作
    makeClick(e) {
        const order_id = e.currentTarget.dataset.id
        beginMakeOrder(order_id).then(() => {
            wx.showToast({
                title: '修改成功',
            });
            this.getOrderListAll();
            this.getOrderList();
        }).catch(err => {
            wx.showToast({
                icon: none,
                title: '修改失败',
            });
            wx.showError('修改失败', err)
        })
    },
    // 点击号码拨打电话
    makeCall(e) {
        console.log(e)
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        })
    },

    // 打印小票
    printClick(e) {
        const order = e.currentTarget.dataset.order
        wx.request({
            url: baseUrl + 'printer/',
            method: 'POST',
            data: {
                order: order
            },
            success: (res) => {
                console.log(res)
                if (res.data.success) {
                    wx.showToast({
                        title: '打印成功',
                    });
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '打印失败，请检查打印机',
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    icon: 'none',
                    title: '打印失败，请检查打印机',
                });
            }
        })
    }

})