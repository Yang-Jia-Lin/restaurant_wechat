let app = getApp()
const baseUrl = app.globalData.baseUrl

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

    // 定时获取订单
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
        }else if (index == 1) {
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
        wx.request({
            url: baseUrl + 'orders/admin/store/1/status/' + this.data.status,
            method: 'GET',
            success: (res) => {
                if (res.statusCode === 200) {
                    console.log("订单列表", res.data);
                    let list = res.data
                    list.forEach(order => {
                        if (order.orderDetails && Array.isArray(order.orderDetails)) {
                            order.orderDetails.forEach(detail => {
                                detail.dish_name_short = detail.dish_name.substring(0, 3);
                            });
                        }
                    });
                    this.setData({
                        list: list
                    })
                } else {
                    console.error("获取订单失败", res);
                }
            },
            fail: (error) => {
                console.error("请求订单列表失败", error);
            }
        });
    },
    getOrderListAll() {
        console.log('获取订单数量')
        wx.request({
            url: baseUrl + 'orders/admin/store/1/statuses/',
            method: 'POST',
            data: {
                statuses: ['制作中', '等待中', '配送中']
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    console.log("订单数量", res.data['制作中']);
                    this.setData({
                        number1: res.data['制作中'],
                        number2: res.data['等待中'],
                        number3: res.data['配送中'],
                    })
                } else {
                    console.error("获取订单数量失败", res);
                }
            },
            fail: (error) => {
                console.error("请求订单数量失败", error);
            }
        });
    },


    //修改状态：点击完成制作
    madeClick(e) {
        const order = e.currentTarget.dataset.order
        const order_id = order.order_id
        const status = order.order_type == '外卖' ? '配送中' : '已完成'
        wx.request({
            url: baseUrl + 'orders/' + order_id + '/status',
            method: 'PATCH',
            data: {
                status: status
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    console.log(res)
                    wx.showToast({
                        title: '修改成功',
                    });
                    this.getOrderListAll();
                    this.getOrderList();
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '提交失败',
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    icon: 'none',
                    title: '提交失败',
                });
            }
        })
    },
    // 修改状态：点击提前制作
    makeClick(e) {
        const order_id = e.currentTarget.dataset.id
        wx.request({
            url: baseUrl + 'orders/' + order_id + '/begin-make',
            method: 'PATCH',
            success: (res) => {
                if (res.statusCode === 200) {
                    console.log(res)
                    wx.showToast({
                        title: '修改成功',
                    });
                    this.getOrderListAll();
                    this.getOrderList();
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '提交失败',
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    icon: 'none',
                    title: '提交失败',
                });
            }
        })
    },
    // 修改状态：点击配送完成
    takeOutClick(e) {
        const order_id = e.currentTarget.dataset.id
        const status = '已完成'
        wx.request({
            url: baseUrl + 'orders/' + order_id + '/status',
            method: 'PATCH',
            data: {
                status: status
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    console.log(res)
                    wx.showToast({
                        title: '修改成功',
                    });
                    this.getOrderListAll();
                    this.getOrderList();
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '提交失败',
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    icon: 'none',
                    title: '提交失败',
                });
            }
        })
    },
    // 配送时点击号码拨打电话
    makeCall(e) {
        console.log(e)
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        })
    },

    // 打印小票
    printClick(e){
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