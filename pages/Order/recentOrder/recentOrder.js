import {
    getCurrentOrder,
    changeDeliverTime,
    beginMakeOrder,
    getQueueNum
} from '../../../api/orderService'
import {
    scheduleTakeSlots,
    scheduleDeliverySlots,
    getDeliveryDate
} from '../../../utils/timeProc'
import { showError } from '../../../utils/tool';

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

    // 获取订单信息
    getRecentOrder(order_id) {
        getCurrentOrder(order_id).then(order => {
            this.setData({
                recentOrder: order,
                haveOrder: true,
                deliverTime: order.delivery_time.slice(0, 5)
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

    // 修改时间
    onDeliveryTimeChange(e) {
        this.getTimesOption()
        const time = this.data.deliverTimes[e.detail.value]
        wx.showModal({
            title: '提示',
            content: '确定' + time + '取餐吗？',
            complete: (res) => {
                if (res.cancel) {
                    return;
                }
                if (res.confirm) {
                    this.changeTime(time)
                }
            }
        })
    },
    changeTime(time) {
        const newTime = getDeliveryDate('', time)
        const orderId = this.data.recentOrder.order_id
        changeDeliverTime(orderId, newTime).then(() => {
            this.onShow()
            wx.showToast({
                title: '修改成功',
            });
        }).catch(error => {
            showError("更新订单失败", error);
        });
    },

    // 提前排单
    onPreMakeClick() {
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
        beginMakeOrder(order_id).then(() => {
            wx.showToast({
                title: '排号成功',
            });
            this.onShow()
        }).catch(error => {
            showError('排号失败', error)
        })
    }
})