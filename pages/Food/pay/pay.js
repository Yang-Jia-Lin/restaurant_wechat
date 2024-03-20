let app = getApp();
const retryInterval = 1000;
const baseUrl = app.globalData.baseUrl;

function generateOptions(startTime, endTime) {
    let options = [];
    // 格式化时间
    const startDate = new Date(`2024-01-01T${startTime}`);
    const endDate = new Date(`2024-01-01T${endTime}`);
    // 将startTime调整到最近的20分钟间隔
    const startMinutes = startDate.getMinutes();
    const additionalMinutes = 20 - (startMinutes % 20);
    startDate.setMinutes(startMinutes + additionalMinutes);
    // 生成时间选项
    while (startDate <= endDate) {
        const hours = startDate.getHours();
        const minutes = startDate.getMinutes();
        const timeString = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
        options.push(timeString);
        startDate.setMinutes(startDate.getMinutes() + 20);
    }
    return options;
}
function convertToDateTime(timeStr) {
    // 获取当前日期
    const now = new Date();

    // 分解字符串为小时和分钟
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    // 设置小时和分钟
    now.setHours(hours, minutes, 0, 0); // 设置秒和毫秒为0

    return now;
}
function getCurrentHourMinutes() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
}

Page({
    data: {
        // 基本信息
        userInfo: app.globalData.userInfo,
        storeInfo: app.globalData.storeInfo,
        serviceType: app.globalData.serviceType,
        distance: app.globalData.storeInfo.distance.toFixed(2),

        // 订单信息
        cartList: [],
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
        couponsNum: 0,
        currentCouponsId: null,
        curentCouponsPrice: 0
    },
    onShow() {
        this.setData({
            serviceType: app.globalData.serviceType,
            storeInfo: app.globalData.storeInfo,
            addressInfo: app.globalData.addressInfo,
            deliveryNowClock: false,
            deliveryReserveClock: false
        });
        this.getTotalPrice();
        this.data.serviceType === '到店' ? this.generateTakeTimeOptions() : this.generateDeliveryTimeOptions();
    },

    // 1.生成可用取餐时间（自提）/ 派送时间（外送）
    generateTakeTimeOptions: function () {
        // 当前时间
        const now = new Date();
        const currentHourMinutes = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':00';

        // 营业时间
        const businessHours = this.data.storeInfo.business_hours.split(" ");
        let timeOptions = [];

        // 计算可用堂食时间
        businessHours.forEach(period => {
            let [periodStart, periodEnd] = period.split("-");
            let startTime = currentHourMinutes > periodStart ? currentHourMinutes : periodStart;
            let options = generateOptions(startTime, periodEnd);
            timeOptions = [...timeOptions, ...options];
        });

        this.setData({
            deliveryTimeOptions: timeOptions.filter((option, index) => timeOptions.indexOf(option) === index), // 移除重复项
            deliveryTime: timeOptions[0] || "暂无可用时间",
        });

        this.checkTime()
    },
    generateDeliveryTimeOptions: function () {
        // 当前时间
        const now = new Date();
        const currentHourMinutes = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':00';

        // 营业时间
        const businessHours = this.data.storeInfo.business_hours.split(" ");
        // 高峰时间
        const peakTimes = [{
                start: this.data.storeInfo.takeout_stop_begin1,
                end: this.data.storeInfo.takeout_stop_end1
            },
            {
                start: this.data.storeInfo.takeout_stop_begin2,
                end: this.data.storeInfo.takeout_stop_end2
            }
        ];

        // 计算当前可用外卖时间
        let timeOptions = [];
        businessHours.forEach(period => {
            let [periodStart, periodEnd] = period.split("-");
            let startTime = currentHourMinutes > periodStart ? currentHourMinutes : periodStart;
            let options = generateOptions(startTime, periodEnd);
            options = options.filter(time => {
                const timeInMinutes = this.timeToMinutes(time);
                return !peakTimes.some(peakTime => {
                    return timeInMinutes >= this.timeToMinutes(peakTime.start) && timeInMinutes <= this.timeToMinutes(peakTime.end);
                });
            });
            timeOptions = [...timeOptions, ...options];
        });
        // 检查可用时间是否小于25分钟
        if (timeOptions[0]) {
            const nearestTime = convertToDateTime(timeOptions[0])
            const timeDiff = nearestTime - now; // 计算时间差（毫秒）
            const diffInMinutes = timeDiff / (1000 * 60); // 转换为分钟
            if (diffInMinutes < 25) {
                timeOptions = timeOptions.slice(1);
            }
        }
        // 去重后设置数据
        this.setData({
            deliveryTimeOptions: timeOptions.filter((option, index) => timeOptions.indexOf(option) === index),
            deliveryTime: timeOptions[0] || "暂无可用时间",
        });

        this.checkTakeoutTime()
    },
    timeToMinutes: function (time) {
        const [hours, minutes] = time.split(":");
        return parseInt(hours) * 60 + parseInt(minutes);
    },
    checkTime() {
        // 当前时间
        const now = new Date();
        const currentHourMinutes = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':00';
        // 营业时间
        const businessHours = this.data.storeInfo.business_hours.split(" ");
        // 判断时间是否在某区间内（函数）
        const isWithinPeriod = (start, end, current) => {
            const startMinutes = this.timeToMinutes(start);
            const endMinutes = this.timeToMinutes(end);
            const currentMinutes = this.timeToMinutes(current);
            return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        };
        // 检查当前时间是否可用
        const isOutOfBusinessHours = !businessHours.some(period => {
            let [periodStart, periodEnd] = period.split("-");
            return isWithinPeriod(periodStart, periodEnd, currentHourMinutes);
        });
        
        if (isOutOfBusinessHours) {
            this.setData({
                deliveryNowClock: true,
                deliveryTimeType: '预约'
            });
            console.log('现在不能送！')
        } else if (this.data.deliveryTime == "暂无可用时间") {
            this.setData({
                deliveryReserveClock: true,
                deliveryNowClock: true,
                deliveryTimeType: ''
            });
            console.log('本店打烊了！现在不能点！')
        }
    },
    checkTakeoutTime() {
        // 当前时间
        const now = new Date();
        const currentHourMinutes = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':00';
        // 营业时间
        const businessHours = this.data.storeInfo.business_hours.split(" ");
        // 高峰时间
        const peakTimes = [{
                start: this.data.storeInfo.takeout_stop_begin1,
                end: this.data.storeInfo.takeout_stop_end1
            },
            {
                start: this.data.storeInfo.takeout_stop_begin2,
                end: this.data.storeInfo.takeout_stop_end2
            }
        ];
        // 判断时间是否在某区间内（函数）
        const isWithinPeriod = (start, end, current) => {
            const startMinutes = this.timeToMinutes(start);
            const endMinutes = this.timeToMinutes(end);
            const currentMinutes = this.timeToMinutes(current);
            return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        };
        // 检查当前时间是否可用
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
            console.log('现在不能送！')
        } else if (this.data.deliveryTime == "暂无可用时间") {
            this.setData({
                deliveryReserveClock: true,
                deliveryNowClock: true,
                deliveryTimeType: ''
            });
            console.log('本店打烊了！今天不能送！')
        }
    },

    // 2.计算价格
    getTotalPrice() {
        let arr = wx.getStorageSync('cart') || [];
        let totalP = this.data.totalPrice
        let totalN = this.data.totalNum
        let couponsPrice = this.data.curentCouponsPrice
        for (var i in arr) {
            totalP += arr[i].quantity * arr[i].price;
            totalN += arr[i].quantity
        }
        totalP -= couponsPrice
        this.setData({
            cartList: arr,
            totalPrice: totalP,
            totalNum: totalN
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

        // 创建订单
        let deliveryTime = null
        if (this.data.delivery_type == '立即') {
            deliveryTime = new Date()
        } else {
            deliveryTime = convertToDateTime(this.data.deliveryTime)
        }
        this.createPayment(deliveryTime)
    },

    // 步骤1：创建订单并获取支付码
    createPayment(deliveryTime) {
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
    endPayment() {
        // 1.增加销量
        const dishIds = this.data.cartList.map(item => item.dish_id);
        wx.request({
            url: baseUrl + 'dishes/sales/increment',
            method: 'PUT',
            data: {
                dishIds: dishIds
            },
            success: (res) => {
                console.log('增加销量中', res)
            },
            fail: (err) => {
                console.error('增加销量错误：', err);
            }
        });

        // 2.赠送积点
        let point = this.data.totalPrice > 10 ? 1 : 0.5
        let points = (parseFloat(this.data.userInfo.points) + point).toFixed(2)
        wx.request({
            url: baseUrl + 'users/' + this.data.userInfo.user_id,
            method: 'PUT',
            data: {
                points: points
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    console.log('增加成功', res.data);
                    this.setUserInfo(res.data.updatedUser)
                } else {
                    console.log('增加失败:', res.errMsg);
                    wx.showModal({
                        title: '提示',
                        content: '积点增加失败，请重试或联系工作人员！',
                        showCancel: false,
                    })
                    return;
                }
            },
            fail: (err) => {
                console.log('增加失败:', err);
                wx.showModal({
                    title: '提示',
                    content: '积点增加失败，请重试或联系工作人员！',
                    showCancel: false,
                })
                return;
            }
        });

        // 3.清空购物车
        wx.setStorageSync('cart', []);

        // 4.跳转订单详情
        wx.redirectTo({
            url: '/pages/My/myOrder/myOrder'
        })
    },
})