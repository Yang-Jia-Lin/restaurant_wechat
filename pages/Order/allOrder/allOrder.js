import {
    getUserAllOrder,
    beginMakeOrder,
} from '../../../api/orderService'
import { showError } from '../../../utils/tool';
const app = getApp()

Page({
    data: {
        userInfo: app.globalData.userInfo || wx.getStorageSync('userInfo'),
        orderList: [],
    },

    onLoad() {
        this.getMyOrderList();
    },
    onShareAppMessage() {
        return {
            title: '唐合丰面馆，一家独特的重庆拌面馆，快来尝尝吧！',
            path: '/pages/Home/home/home?referrer=' + this.data.userInfo.user_id
        };
    },
    onPullDownRefresh() {
        wx.showNavigationBarLoading()
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        setTimeout(function () {
            wx.hideLoading();
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh();
        }, 1000)
        this.getMyOrderList();
    },

    // 获取订单
    getMyOrderList() {
        getUserAllOrder(this.data.userInfo.user_id).then(allOrders => {
            this.setData({
                orderList: allOrders
            });
        }).catch(err => {
            showError('获取订单失败', err);
        })
    },

    // 点击事件
    onCancleOrder() {
        wx.showToast({
            title: '十分抱歉，功能更新中',
            icon: 'none',
            duration: 4000
        });
        return;
        wx.showModal({
            title: '确认取消订单',
            content: '确定要取消订单并退款吗？',
            success: (res) => {
                if (res.confirm) {
                    return
                }
            }
        });
    },
    onPreMakeClick(e) {
        console.log(e)
        wx.showModal({
            title: '提示',
            content: '提前排号后将立即开始制作，请确认您能否立即到店取餐',
            complete: (res) => {
                if (res.cancel) {
                    return;
                }
                if (res.confirm) {
                    this.preMake(e.currentTarget.dataset.id)
                }
            }
        })
    },
    preMake(order_id) {
        beginMakeOrder(order_id).then(() => {
            wx.showToast({
                title: '排号成功',
            });
            this.getMyOrderList()
        }).catch(error => {
            showError('排号失败', error)
        })
    },

    // 页面跳转
    goOrder() {
        wx.switchTab({
            url: '/pages/Food/food/food',
        })
    },
    goOrderDetail(e) {
        wx.setStorageSync('detailOrder', e.currentTarget.dataset.order.order_id)
        wx.navigateTo({
            url: '/pages/Order/detailOrder/detailOrder',
        })
    }
})