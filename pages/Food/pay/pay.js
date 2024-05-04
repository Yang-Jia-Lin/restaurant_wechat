import {
    generateOptions,
    convertToDateTime,
    getCurrentHourMinutes,
    isWithinPeriod
} from '../../../utils/tool'

import {
    updateTimeFunctions
} from '../../../utils/timeProc'

const app = getApp();
const baseUrl = app.globalData.baseUrl;


Page({
    data: {
        // 基本信息
        userInfo: app.globalData.userInfo,

        storeInfo: app.globalData.storeInfo,
        serviceType: app.globalData.serviceType,
        distance: app.globalData.storeInfo.distance.toFixed(2),

        // 订单信息
        cartList: wx.getStorageSync('cart') || [],
        paymentMethod: '微信支付',
        totalPrice: 0.0,
        totalNum: 0,
        note: "",

        // 配送时间相关
        deliveryNowClock: false, //当前不能立即送餐or取餐
        deliveryReserveClock: false, //当前不能预约送餐or取餐
        deliveryTimeType: '立即',
        deliveryTimeOptions: [],
        deliveryTime: '',

        // 优惠信息
        pointsNum: 0,
        points: 0,
        couponsNum: 0,
        currentCouponsId: null,
        curentCouponsPrice: 0
    },
    onShow() {
        let points = this.data.userInfo.points - this.data.pointsNum;
        points = +points.toFixed(1);
        this.setData({
            userInfo: app.globalData.userInfo,
            serviceType: app.globalData.serviceType,
            storeInfo: app.globalData.storeInfo,
            addressInfo: app.globalData.addressInfo,
            deliveryNowClock: false,
            deliveryReserveClock: false,
            points: points
        });
        this.getTotalPrice();
        this.data.serviceType === '到店' ? this.generateTakeTimeOptions() : this.generateDeliveryTimeOptions();

        // test
        const timeslots = wx.getStorageSync('storeTime')
        updateTimeFunctions(timeslots)
    },

    // 1.生成可用时间
    generateTakeTimeOptions: function () {
        const currentHourMinutes = getCurrentHourMinutes();
        const businessHours = this.data.storeInfo.business_hours.split(" ");
        let timeOptions = [];

        // 1.计算可用预约堂食时间
        businessHours.forEach(period => {
            let [periodStart, periodEnd] = period.split("-");
            let startTime = currentHourMinutes > periodStart ? currentHourMinutes : periodStart;
            let options = generateOptions(startTime, periodEnd);
            timeOptions.push(...options);
        });
        timeOptions = [...new Set(timeOptions)];
        this.setData({
            deliveryTimeOptions: timeOptions,
            deliveryTime: timeOptions[0] || "暂无可用时间",
        });

        // 2.计算当前是否可以立即取餐
        const isOutOfBusinessHours = !businessHours.some(period => {
            let [periodStart, periodEnd] = period.split("-");
            return isWithinPeriod(periodStart, periodEnd, currentHourMinutes);
        });
        if (isOutOfBusinessHours) {
            this.setData({
                deliveryNowClock: true,
                deliveryTimeType: '预约'
            });
            console.log('现在不能送！');
        } else if (this.data.deliveryTime === "暂无可用时间") {
            this.setData({
                deliveryReserveClock: true,
                deliveryNowClock: true,
                deliveryTimeType: ''
            });
            console.log('本店打烊了！现在不能点！');
        }
    },
    generateDeliveryTimeOptions: function () {
        const currentHourMinutes = getCurrentHourMinutes();
        const businessHours = this.data.storeInfo.business_hours.split(" ");
        let timeOptions = [];
        const peakTimes = [{
            start: this.data.storeInfo.takeout_stop_begin1,
            end: this.data.storeInfo.takeout_stop_end1
        },
        {
            start: this.data.storeInfo.takeout_stop_begin2,
            end: this.data.storeInfo.takeout_stop_end2
        }
        ];

        // 获取当前日期并判断是否为周末
        const today = new Date();
        const isWeekend = today.getDay() === 6 || today.getDay() === 0; // 6 = Saturday, 0 = Sunday

        // 1.计算当前可用预约外卖时间
        businessHours.forEach(period => {
            let [periodStart, periodEnd] = period.split("-");
            let startTime = currentHourMinutes > periodStart ? currentHourMinutes : periodStart;
            let options = generateOptions(startTime, periodEnd);
            if (!isWeekend) { // 如果不是周末，则过滤掉高峰时段
                options = options.filter(time =>
                    !peakTimes.some(peakTime => isWithinPeriod(peakTime.start, peakTime.end, time))
                );
            }
            timeOptions.push(...options);
        });
        if (timeOptions.length > 0) {
            const now = new Date(`1970/01/01 ${currentHourMinutes}`);
            const nearestTimeOption = new Date(`1970/01/01 ${timeOptions[0]}`);
            const diffInMinutes = (nearestTimeOption - now) / (1000 * 60);
            if (diffInMinutes < 25) {
                timeOptions.shift(); // 移除第一个元素
            }
        }
        timeOptions = [...new Set(timeOptions)]; // 去重
        this.setData({
            deliveryTimeOptions: timeOptions,
            deliveryTime: timeOptions[0] || "暂无可用时间",
        });

        // 2.判断当前能否立即配送
        const isOutOfBusinessHours = !businessHours.some(period => {
            let [periodStart, periodEnd] = period.split("-");
            return isWithinPeriod(periodStart, periodEnd, currentHourMinutes);
        });
        const isInPeakTime = peakTimes.some(peakTime => isWithinPeriod(peakTime.start, peakTime.end, currentHourMinutes));

        if (isInPeakTime || isOutOfBusinessHours) {
            this.setData({
                deliveryNowClock: true,
                deliveryTimeType: '预约'
            });
            console.log('现在不能送！');
        } else if (this.data.deliveryTime === "暂无可用时间") {
            this.setData({
                deliveryReserveClock: true,
                deliveryNowClock: true,
                deliveryTimeType: ''
            });
            console.log('本店打烊了！今天不能送！');
        }
    },

    // 2.计算价格
    getTotalPrice() {
        let arr = wx.getStorageSync('cart') || [];
        let totalP = 0
        let totalN = 0
        let couponsPrice = this.data.curentCouponsPrice
        for (var i in arr) {
            totalP += arr[i].quantity * arr[i].price;
            totalN += arr[i].quantity
        }
        totalP -= couponsPrice;
        totalP -= this.data.pointsNum;
        let points = this.data.userInfo.points - this.data.pointsNum;
        points = +points.toFixed(1);
        this.setData({
            cartList: arr,
            totalPrice: totalP,
            totalNum: totalN,
            points: points
        })
    },

    // 3.处理点击事件
    selectDeliveryType(e) {
        if (this.data.serviceType == '到店') {
            this.generateTakeTimeOptions();
        } else {
            this.generateDeliveryTimeOptions();
        }
        this.setData({
            deliveryTimeType: e.currentTarget.dataset.type
        })
    },
    onDeliveryTimeChange: function (e) {
        if (this.data.serviceType == '到店') {
            this.generateTakeTimeOptions();
        } else {
            this.generateDeliveryTimeOptions();
        }
        this.setData({
            deliveryTime: this.data.deliveryTimeOptions[e.detail.value]
        });
    },
    onNoteClick() {
        const that = this;
        wx.showModal({
            title: '订单备注',
            content: '', // 弹窗内容
            editable: true,
            placeholderText: '请输入备注', // 输入框提示文字
            success(res) {
                if (res.confirm && res.content) {
                    that.setData({
                        note: res.content
                    });
                }
            }
        });
    },
    onCouponsClick() {

    },
    onPointClick() {
        wx.showModal({
            title: '提示',
            content: '使用积点后当餐免单，确定使用吗？',
            complete: (res) => {
                if (res.cancel) {
                    this.setData({
                        pointsNum: 0
                    })
                    this.getTotalPrice()
                }
                if (res.confirm) {
                    this.setData({
                        pointsNum: this.data.totalPrice
                    })
                    this.getTotalPrice()
                }
            }
        })
    },
    selectPaymentMethod: function (e) {
        // 更新支付方式
        this.setData({
            paymentMethod: e.currentTarget.dataset.method,
        });
    },
    onPayButtonClick() {
        if (this.data.deliveryTime == "暂无可用时间") {
            wx.showModal({
                title: '提示',
                content: '非常抱歉，本店打烊啦！明天再来吧',
                showCancel: false, // 隐藏取消按钮
                confirmText: '确定',
            });
            return; // 退出支付逻辑
        }

        // 订单准备
        let deliveryTime = null
        if (this.data.delivery_type == '立即') {
            deliveryTime = new Date()
        } else {
            deliveryTime = convertToDateTime(this.data.deliveryTime)
        }

        // 创建订单
        if (this.data.pointsNum == 0) {
            this.createPayment(deliveryTime)
        } else {
            this.createPointsPay(deliveryTime)
        }

    },

    // 微信支付
    // 步骤1：创建订单并获取支付码
    createPayment(deliveryTime) {
        // 显示加载提示
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
            delivery_type: this.data.deliveryTimeType,
            delivery_time: deliveryTime,
            total_price: this.data.totalPrice,
            payment_method: this.data.paymentMethod,
            description: '唐合丰面馆订单',
            note: this.data.note,
            address: "",
            call_name: "",
            phone: app.globalData.userInfo.phone_number,
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

    // 步骤2：发起支付
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

    // 步骤3：支付完成后处理
    // TODO: 使用模块化API
    endPayment() {
        // 1.增加销量
        this.addSales()

        // 2.赠送积点
        if (app.globalData.userInfo.phone_number) {
            this.addPoints()
        }

        // 3.清空购物车
        wx.setStorageSync('cart', []);

        // 4.跳转订单详情
        wx.redirectTo({
            url: '../../Order/allOrder/allOrder'
        })
    },
    addSales() {
        const dishIds = this.data.cartList.map(item => item.dish_id);
        wx.request({
            url: baseUrl + 'dishes/sales/increment',
            method: 'PUT',
            data: {
                dishIds: dishIds
            }
        });
    },
    addPoints() {
        let point = this.data.totalPrice >= 8 ? 0.5 : 0.1;
        if (this.data.totalPrice >= 10) point = 1;

        wx.request({
            url: baseUrl + 'users/addPoints/' + this.data.userInfo.user_id,
            method: 'PUT',
            data: {
                pointsToAdd: point
            },
            success: (res) => {
                console.log('积点增加ing', res);
                if (res.data.success) {
                    app.globalData.userInfo = res.data.updatedUser
                    app.trigger('userInfoUpdated');
                    wx.setStorageSync('userInfo', res.data.updatedUser);
                } else {
                    console.log('积点增加失败:', res.errMsg);
                    wx.showToast({
                        title: '积点增加失败，请重试或联系工作人员！',
                        icon: 'none'
                    });
                }
            },
            fail: (err) => {
                console.log('积点增加失败:', err);
                wx.showToast({
                    title: '积点增加失败，请重试或联系工作人员！',
                    icon: 'none'
                });
            },

        });
    },


    // 积点支付
    // TODO: 使用模块化API
    // 步骤1：创建订单并获取支付码
    createPointsPay(deliveryTime) {
        // 显示加载提示
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
            delivery_type: this.data.deliveryTimeType,
            delivery_time: deliveryTime,
            total_price: this.data.totalPrice,
            payment_method: this.data.paymentMethod,
            description: '唐合丰面馆订单',
            note: this.data.note,
            address: "",
            call_name: "",
            phone: app.globalData.userInfo.phone_number,
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
                pointsToDeduct: this.data.pointsNum,
            },
            success: (res) => {
                console.log('创建订单中', res)
                if (res.statusCode === 201 && res.data.success) {
                    this.endPaymentPoint();
                    wx.setStorageSync('orderId', res.data.order.order_id)
                    let user = res.data.user;
                    user.points = +parseFloat(res.data.user.points).toFixed(1);
                    user.balance = +parseFloat(res.data.user.balance).toFixed(1);
                    app.globalData.userInfo = user
                    app.trigger('userInfoUpdated');
                    wx.setStorageSync('userInfo', user);
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

    // 步骤2：支付完成后处理
    endPaymentPoint() {
        // 1.增加销量
        this.addSales()

        // 2.清空购物车
        wx.setStorageSync('cart', []);

        // 3.跳转订单详情
        wx.redirectTo({
            url: '../../Order/allOrder/allOrder'
        })
    },
})