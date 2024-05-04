import {
    getCurrentOrder,
    changeDeliverTime,
    getQueueNum
} from '../../../api/orderService'
import {
    scheduleTakeSlots,
    scheduleDeliverySlots,
    getDeliveryDate
} from '../../../utils/timeProc'
import { showError } from '../../../utils/tool';

const app = getApp()
const baseUrl = app.globalData.baseUrl;

Page({
    data: {
        recentOrder: {},
        haveOrder: false,
        deliverTimes: [],
        deliverTime: '',
        queueOrdersNum: 0
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

    // 获取信息
    getRecentOrder(order_id) {
        getCurrentOrder(order_id).then(order => {
            this.setData({
                recentOrder: order,
                haveOrder: true
            })
            if (order.order_status == '等待中')
                this.getTimesOption()
            else if (order.order_status == '制作中')
                this.getQueueNum()
        }).catch(err => {
            wx.setStorageSync('orderId', '');
            this.setData({
                haveOrder: false
            })
            showError("加载出现问题", err)
        })
    },
    getTimesOption() {
        const timeslots = wx.getStorageSync('storeTime'); // 门店所有营业时间
        const deliveryTimes = this.data.recentOrder.order_type == '到店' ?
            scheduleTakeSlots(timeslots) : scheduleDeliverySlots(timeslots)
        this.setData({
            deliverTimes: deliveryTimes,
            deliverTime: deliveryTimes[0]
        })
    },
    getQueueNum() {
        getQueueNum(this.data.recentOrder.pickup_id).then(number => {
            this.setData({
                queueOrdersNum: number
            })
        }).catch(err => {
            showError("加载出现问题", err)
        })
    },

    // 点击事件
    onDeliveryTimeChange(e) {   // 点击picker选择
        this.getTimesOption()
        this.setData({
            deliverTime: this.data.deliverTimes[e.detail.value]
        });
    },
    confirmChange() {   // 点击确定修改
        const newTime = getDeliveryDate('', this.data.deliverTime)
        const orderId = this.data.recentOrder.order_id
        changeDeliverTime(orderId, newTime).then(order => {
            console.log("更新后的订单：", order);
            this.setData({
                recentOrder: order
            })
        }).catch(error => {
            showError("更新订单失败", error);
        });
    },
    makeClick() {
        wx.showModal({
            title: '提示',
            content: '提前排号后将立即开始制作，请确认您能否立即到店取餐',
            complete: (res) => {
                if (res.cancel) {
                    return;
                }
                if (res.confirm) {
                    this.preMake(this.data.recentOrder.order_id)
                }
            }
        })
    },
    preMake(order_id) {
        wx.request({
            url: baseUrl + 'orders/' + order_id + '/begin-make',
            method: 'PATCH',
            success: (res) => {
                console.log(res)
                if (res.statusCode === 200) {
                    console.log(res)
                    wx.showToast({
                        title: '排号成功',
                    });
                    this.onShow();
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '排号失败，请重试',
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    icon: 'none',
                    title: '排号失败，请重试',
                });
            }
        })
    }
})