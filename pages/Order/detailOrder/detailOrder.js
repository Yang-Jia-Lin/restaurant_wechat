import {
    getCurrentOrder,
    changeDeliverTime,
    beginMakeOrder,
    getQueueNum
} from '../../../api/orderService'
import {
    scheduleTakeSlots,
    scheduleDeliverySlots,
    getDeliveryDate,
    areSameDay
} from '../../../utils/timeProc'
import { showError } from '../../../utils/tool';

Page({
    data: {
        detailOrder: {},
        haveOrder: false,
        queueOrdersNum: 0,  // 前方人数（制作中）
        deliverTimes: [],   // 修改时间（等待中）
        orderStatus: 1
    },
    onShow() {
        this.getOrder();
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
        this.getOrder();
    },

    // 获取订单
    getOrder() {
        const order_id = wx.getStorageSync('detailOrder') || ''
        if (order_id !== '') {
            getCurrentOrder(order_id).then(order => {
                const status = order.order_status
                const statusNum = this.getStatusNum(status)
                this.setData({
                    detailOrder: order,
                    haveOrder: true,
                    orderStatus: statusNum
                })
                this.getQueueNum()
                if (status == '等待中')
                    this.getTimesOption()
            }).catch(err => {
                showError("获取订单失败", err)
            })
        } else {
            wx.setStorageSync('detailOrder', '');
            this.setData({
                detailOrder: {},
                haveOrder: false
            })
        }
    },

    // 准备数据
    getStatusNum(status) {
        if (status == '等待中') return 1;
        else if (status == '制作中') return 2;
        else if (status == '配送中') return 3;
        else return 4;
    },
    getTimesOption() {
        const timeslots = wx.getStorageSync('storeTime');
        const deliveryTimes = this.data.detailOrder.order_type == '到店' ?
            scheduleTakeSlots(timeslots) : scheduleDeliverySlots(timeslots)
        this.setData({
            deliverTimes: deliveryTimes
        })
    },
    getQueueNum() {
        getQueueNum(this.data.detailOrder.pickup_id).then(number => {
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
            content: '确定修改为' + time + '吗？',
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
        const orderId = this.data.detailOrder.order_id
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
        let hint = '提前排号后将立即开始制作，请确认您能否立即到店取餐'
        if (this.data.detailOrder.order_type == '外卖') {
            hint = '提前排号后将立即开始制作，请确认您能否需要立即送餐'
        }
        wx.showModal({
            title: '提示',
            content: hint,
            complete: (res) => {
                if (res.cancel) {
                    return;
                }
                if (res.confirm) {
                    this.preMake(this.data.detailOrder.order_id)
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
    },

    // 页面跳转
    goAllOrder() {
        wx.navigateTo({
            url: '/pages/Order/allOrder/allOrder',
        })
    },
    goOrder() {
        wx.switchTab({
            url: '/pages/Food/food/food',
        })
    }
})