let app = getApp()
const baseUrl = app.globalData.baseUrl
//'待支付', '等待中', '制作中', '配送中', '退款中', '已完成', '已取消', '已退款'

Page({
    data: {
        userInfo: app.globalData.userInfo || wx.getStorageSync('userInfo'),
        navbar: ["全部订单", "进行中", "已完成"],
        currentTab: 0,

        list: [],
        groupedOrders: [],
        currentList: []
    },

    onLoad() {
        this.getMyOrderList();
    },
    onShareAppMessage: function () {
        return {
            title: '唐合丰面馆，一家独特的重庆拌面馆，快来尝尝吧！',
            path: '/pages/Home/home/home'
        }
    },
    onRefresh() {
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
        this.getMyOrderList();
    },
    onPullDownRefresh() {
        this.onRefresh();
    },

    getMyOrderList() {
        // 显示加载提示
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        // 获取数据
        wx.request({
            url: baseUrl + 'orders/user/' + this.data.userInfo.user_id,
            method: 'GET',
            success: (res) => {
                if (res.statusCode === 200) {
                    // 分类订单数据
                    const groupedOrders = res.data.reduce((acc, order) => {
                        if (!acc[order.order_status]) {
                            acc[order.order_status] = [];
                        }
                        acc[order.order_status].push(order);
                        return acc;
                    }, {});

                    this.setData({
                        list: res.data,
                        currentList: res.data,
                        groupedOrders: groupedOrders
                    });
                    console.log('获取订单数据成功', res.data, groupedOrders);
                } else {
                    console.log('获取订单数据失败:', res.errMsg);
                }
            },
            fail: (err) => {
                console.error('请求服务器失败:', err);
            },
            complete: () => {
                // 无论请求成功或失败，都关闭加载提示
                wx.hideLoading();
            }
        });
    },
    navbarTap(e) {
        let index = e.currentTarget.dataset.idx;
        this.setData({
            currentTab: index
        })
        if (index == 1) { // 进行中
            const orders1 = this.data.groupedOrders['等待中'] || []
            const orders2 = this.data.groupedOrders['制作中'] || []
            const orders3 = this.data.groupedOrders['配送中'] || []
            const orders4 = this.data.groupedOrders['退款中'] || []
            let currentOrders = [...orders1, ...orders2, ...orders3, ...orders4]
            this.setData({
                currentList: currentOrders
            })
        } else if (index == 2) { // 已完成
            const orders1 = this.data.groupedOrders['已完成'] || []
            const orders2 = this.data.groupedOrders['已取消'] || []
            const orders3 = this.data.groupedOrders['已退款'] || []
            let currentOrders = [...orders1, ...orders2, ...orders3]
            this.setData({
                currentList: currentOrders
            })
        } else {
            this.setData({
                currentList: this.data.list
            })
        }
    },

    // 点击事件
    cancleOrder() {
        wx.showModal({
            title: '确认取消订单',
            content: '确定要取消订单并退款吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.showToast({
                        title: '十分抱歉，功能更新中，退款失败，请去收银台联系店员进行取消',
                        icon: 'none',
                        duration: 4000
                    });
                }
            }
        });
    },
    makeClick(e) {
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
                    this.getMyOrderList();
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