import {
    testTimeFunctions,
    canTakeNow,
    canDeliverNow,
    scheduleTakeSlots,
    scheduleDeliverySlots,
    getDeliveryDate
} from '../../../utils/timeProc'
import { showError, toFloat } from '../../../utils/tool';
import { payInvite } from '../../../api/inviteService';
import {
    addSales,
    addPoints
} from '../../../api/orderService';
const app = getApp();
const baseUrl = app.globalData.baseUrl;

Page({
    data: {
        // 基本信息(全局)
        userInfo: app.globalData.userInfo,
        storeInfo: app.globalData.storeInfo,
        serviceType: app.globalData.serviceType,
        distance: app.globalData.storeInfo.distance.toFixed(2),

        // 订单信息
        cartList: wx.getStorageSync('cart') || [],
        paymentMethod: '微信支付',
        totalPrice: 0.0,
        totalNum: 0,
        note: '',

        // 时间相关
        deliverType: '立即',
        deliverNow: true,
        deliverTimes: [],
        deliverTime: '',
        refreshTime: '',

        // 优惠信息
        pointsRemain: app.globalData.userInfo.points,
        pointsDiscount: 0.0,
    },

    onShow() {
        let arr = wx.getStorageSync('cart') || []
        arr.forEach(item => {
            item.price = toFloat(item.price, 2)
        })
        this.setData({  // 数据更新
            userInfo: app.globalData.userInfo,
            storeInfo: app.globalData.storeInfo,
            serviceType: app.globalData.serviceType,
            addressInfo: app.globalData.addressInfo,
            pointsRemain: app.globalData.userInfo.points,
            pointsDiscount: 0,
            cartList: arr,
        });
        console.log('支付页面的购物车：', this.data.cartList)
        this.getTotalPrice();   // 重新计算价格
        this.getTimesOption();  // 重新计算时间
    },

    // 1.计算时间
    getTimesOption: function () {
        const timeslots = wx.getStorageSync('storeTime'); // 门店所有营业时间
        testTimeFunctions(timeslots)
        const now = new Date()

        if (this.data.serviceType === '到店') {
            const canDeliveryNow = canTakeNow(timeslots)
            const deliveryTimes = scheduleTakeSlots(timeslots)
            this.setData({
                deliverNow: canDeliveryNow,
                deliverTimes: deliveryTimes,
                deliverTime: deliveryTimes[0],
                refreshTime: now
            })
        } else {
            const canDeliveryNow = canDeliverNow(timeslots)
            const deliveryTimes = scheduleDeliverySlots(timeslots)
            this.setData({
                deliverNow: canDeliveryNow,
                deliverTimes: deliveryTimes,
                deliverTime: deliveryTimes[0],
                refreshTime: now
            })
        }
        if (!this.data.deliverNow) {
            this.setData({
                deliverType: '预约'
            })
        }
    },

    // 2.计算价格和积点优惠
    getTotalPrice() {
        const arr = wx.getStorageSync('cart') || [];
        const pointDis = this.data.pointsDiscount;
        const pointRem = toFloat(this.data.userInfo.points - pointDis, 2);

        // 计算价格
        let totalP = 0;
        let totalN = 0;
        for (var i in arr) {
            totalP += arr[i].quantity * arr[i].price;
            totalN += arr[i].quantity
        }
        totalP = toFloat(totalP, 2)
        totalP -= pointDis;

        // 更新信息
        this.setData({
            totalPrice: totalP,
            totalNum: totalN,
            pointsRemain: pointRem
        })
    },

    // 3.处理点击事件
    selectDeliveryType(e) {
        this.setData({
            deliverType: e.currentTarget.dataset.type
        })
        this.getTimesOption()
    },
    onDeliveryTimeChange: function (e) {
        this.getTimesOption()
        this.setData({
            deliverTime: this.data.deliverTimes[e.detail.value]
        });
    },
    onNoteClick() {
        const that = this;
        wx.showModal({
            title: '订单备注',
            editable: true,
            placeholderText: '请输入备注',
            success(res) {
                if (res.confirm && res.content) {
                    that.setData({
                        note: res.content
                    });
                }
            }
        });
    },
    onPointClick() {
        if (this.data.pointsDiscount == 0) {
            wx.showModal({
                title: '提示',
                content: '确定使用积点支付本单吗？',
                complete: (res) => {
                    if (res.cancel) {
                        return
                    }
                    if (res.confirm) {
                        this.setData({
                            pointsDiscount: this.data.totalPrice
                        })
                        this.getTotalPrice()
                    }
                }
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '确定取消使用吗？',
                complete: (res) => {
                    if (res.cancel) {
                        return
                    }
                    if (res.confirm) {
                        this.setData({
                            pointsDiscount: 0
                        })
                        this.getTotalPrice()
                    }
                }
            })
        }
    },
    selectPaymentMethod: function (e) {
        this.setData({
            paymentMethod: e.currentTarget.dataset.method,
        });
    },
    onPayButtonClick() {
        // 处理邀请消息订阅
        if (wx.getStorageSync('haveInvite')) {
            const tmplIds = ['oSA8CXtPkmkXZ0kz_cbkPBlBHiAYMaTFTACyddPvM0I'];
            wx.requestSubscribeMessage({
                tmplIds: tmplIds,
                success: res => {
                    console.log('订阅消息授权结果:', res);
                    wx.setStorageSync('haveInvite', false);
                },
                complete: () => {
                    this.onPayButtonClickEnd()
                }
            });
        } else {
            this.onPayButtonClickEnd()
        }
    },
    onPayButtonClickEnd() {
        // 处理deliveryTime
        const delivery_time = this.data.deliverTime
        const delivery_type = this.data.deliverType
        if (delivery_type == '预约' && delivery_time == '暂无可用时间' ||
            delivery_type == '立即' && !this.data.deliverNow) {
            wx.showModal({
                title: '提示',
                content: '非常抱歉，本店打烊啦！明天再来吧',
                showCancel: false, // 隐藏取消按钮
                confirmText: '确定',
            });
            return;
        }
        // this.data.deliveryTime是用户展示的字符串，需要修改为Date()类型
        const deliveryDate = getDeliveryDate(delivery_type, delivery_time)

        // 检查是否需要刷新
        const now = new Date()
        const timeDiff = (now - this.data.refreshTime) / (1000 * 60);
        if (timeDiff > 10) {
            this.setData({
                refreshTime: new Date()
            })
            wx.showModal({
                title: '提示',
                content: '您停留太久啦！需要刷新一下，注意查看您的时间',
                showCancel: false, // 隐藏取消按钮
                confirmText: '确定',
                success: () => {
                    this.getTimesOption();
                }
            });
            return;
        }

        // 提交订单
        if (this.data.pointsDiscount == 0)
            this.createPayment(deliveryDate)
        else
            this.createPointsPay(deliveryDate)
    },

    // 微信支付
    createPayment(deliveryTime) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        // 准备订单数据
        let addPoint = 0;
        this.data.cartList.forEach(item => {
            let pointsPerItem = 0; // 单个菜品的积点
            if (item.price >= 10)
                pointsPerItem = 1;
            else if (item.price >= 8)
                pointsPerItem = 0.5;
            else if (item.price > 0)
                pointsPerItem = 0.1;
            addPoint += pointsPerItem * item.quantity;
        });
        console.log('积点赠送:', addPoint)
        let orderData = {
            user_id: app.globalData.userInfo.user_id,
            openid: app.globalData.userInfo.openid,
            store_id: app.globalData.storeInfo.store_id,
            order_type: app.globalData.serviceType,
            pickup_number: 0,
            order_status: '待支付',
            order_time: new Date(),
            delivery_type: this.data.deliverType,
            delivery_time: deliveryTime,
            total_price: this.data.totalPrice,
            payment_method: this.data.paymentMethod,
            description: '唐合丰面馆订单',
            note: this.data.note,
            address: "",
            call_name: "",
            phone: app.globalData.userInfo.phone_number,
            points: addPoint
        };
        if (this.data.serviceType == '外卖') {
            orderData.address = this.data.addressInfo.address_detail
            orderData.call_name = this.data.addressInfo.name
            orderData.phone = this.data.addressInfo.phone
        }
        const orderDetails = this.data.cartList

        // TODO: 使用模块化API
        // 发起订单
        wx.request({
            url: baseUrl + 'pay/create_and_pay',
            method: 'POST',
            data: {
                orderData: orderData,
                orderDetails: orderDetails
            },
            success: (res) => {
                console.log('创建订单中', res)
                if (res.statusCode === 201 && res.data.success) {
                    this.startPayment(res.data.paySignInfo);
                    wx.setStorageSync('orderId', res.data.order.order_id)
                } else {
                    wx.showToast({
                        title: '支付创建失败，请退出重试',
                        icon: 'none'
                    });
                }
            },
            fail: (createOrderError) => {
                wx.showToast({
                    title: '订单创建失败，请重试',
                    icon: 'none'
                });
                console.error('订单创建错误：', createOrderError);
                reject('订单创建失败');
            },
            complete: () => {
                // 无论请求成功或失败，都关闭加载提示
                wx.hideLoading();
            }
        });
    },
    startPayment(paySignInfo) {
        wx.requestPayment({
            timeStamp: paySignInfo.timestamp,
            nonceStr: paySignInfo.nonce_str,
            package: paySignInfo.package,
            signType: paySignInfo.signType,
            paySign: paySignInfo.paySign,
            success: (res) => {
                wx.showToast({
                    title: '支付成功',
                    icon: 'success'
                });
                console.log('支付成功', res)
                this.endPayment()
            },
            fail: (err) => {
                // 支付失败的回调
                wx.showToast({
                    title: '支付失败，请重试',
                    icon: 'none'
                });
                console.error('支付失败：', err);
            }
        });
    },
    endPayment() {
        // 1.增加销量
        addSales(this.data.cartList.map(item => item.dish_id))

        // 2.更新邀请信息
        if (wx.getStorageSync('inviter')) {
            payInvite(this.data.userInfo.user_id)
                .then(isInvite => {
                    if (isInvite)
                        console.log('完成邀请成功')
                    else
                        console.log('还没有注册')
                    wx.setStorageSync('inviter', null)
                })
                .catch(err => {
                    showError('更新邀请失败', err)
                })
        }

        // 3.赠送积点
        if (app.globalData.userInfo.phone_number) {
            let addPoint = 0; // 初始化
            this.data.cartList.forEach(item => {
                let pointsPerItem = 0; // 单个菜品的积点
                if (item.price >= 10)
                    pointsPerItem = 1;
                else if (item.price >= 8)
                    pointsPerItem = 0.5;
                else if (item.price > 0)
                    pointsPerItem = 0.1;
                addPoint += pointsPerItem * item.quantity;
            });
            console.log('积点赠送:', addPoint)
            addPoints(this.data.userInfo.user_id, addPoint, '消费赠送')
                .then(user => {
                    app.globalData.userInfo = user
                    app.trigger('userInfoUpdated');
                    wx.setStorageSync('userInfo', user);
                    wx.showModal({
                        title: '恭喜',
                        content: addPoint + '个积点已下发至您的账户',
                        cancelText: false,
                        complete: () => {
                            // 4.清空购物车
                            wx.setStorageSync('cart', []);
                            // 5.跳转订单详情
                            wx.switchTab({
                                url: '/pages/Order/recentOrder/recentOrder',
                            })
                        }
                    });
                }).catch(err => {
                    showError('积点增加失败', err)
                })
        }
    },

    // 积点支付
    createPointsPay(deliveryTime) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        // 订单数据
        let orderData = {
            user_id: app.globalData.userInfo.user_id,
            openid: app.globalData.userInfo.openid,
            store_id: app.globalData.storeInfo.store_id,
            order_type: app.globalData.serviceType,
            pickup_number: 0,
            order_status: '待支付',
            order_time: new Date(),
            delivery_type: this.data.deliverType,
            delivery_time: deliveryTime,
            total_price: this.data.totalPrice,
            payment_method: this.data.paymentMethod,
            description: '唐合丰面馆订单',
            note: this.data.note,
            address: "",
            call_name: "",
            phone: app.globalData.userInfo.phone_number,
            points: -this.data.pointsDiscount
        };
        if (this.data.serviceType == '外卖') {
            orderData.address = this.data.addressInfo.address_detail
            orderData.call_name = this.data.addressInfo.name
            orderData.phone = this.data.addressInfo.phone
        }
        const orderDetails = this.data.cartList

        // 发起订单
        wx.request({
            url: baseUrl + 'pay/create_and_pay_points',
            method: 'POST',
            data: {
                orderData: orderData,
                orderDetails: orderDetails,
                pointsToDeduct: this.data.pointsDiscount,
            },
            success: (res) => {
                console.log('创建订单中', res)
                if (res.statusCode === 201 && res.data.success) {
                    wx.setStorageSync('orderId', res.data.order.order_id)
                    let user = res.data.user;
                    user.points = toFloat(user.points, 2)
                    user.balance = toFloat(user.balance, 2)
                    app.globalData.userInfo = user
                    app.trigger('userInfoUpdated');
                    wx.setStorageSync('userInfo', user);
                    this.endPaymentPoint();
                } else {
                    wx.showToast({
                        title: '支付创建失败，请退出重试',
                        icon: 'none'
                    });
                }
            },
            fail: (createOrderError) => {
                wx.showToast({
                    title: '订单创建失败，请重试',
                    icon: 'none'
                });
                console.error('订单创建错误：', createOrderError);
                reject('订单创建失败');
            },
            complete: () => {
                wx.hideLoading();
            }
        });
    },
    endPaymentPoint() {
        // 1.增加销量
        addSales(this.data.cartList.map(item => item.dish_id))

        // 2.清空购物车
        wx.setStorageSync('cart', []);

        // 3.跳转订单详情
        wx.switchTab({
            url: '/pages/Order/recentOrder/recentOrder',
        })
    },
})