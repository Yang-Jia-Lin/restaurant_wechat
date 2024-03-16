const app = getApp();
const baseUrl = app.globalData.baseUrl

Page({
    data: {
        userInfo: app.globalData.userInfo,
        isUserRegister: true,
        recentOrder: {},
        haveOrder: false,
    },

    onShow() {
        let order_id = wx.getStorageSync('orderId') || ''
        if(order_id){
            this.getRecentOrder(order_id);
        }
    },

    getRecentOrder(order_id){
        wx.request({
            url: baseUrl + 'orders/user/details/' + order_id,
            method: 'GET',
            success: (res) => {
                console.log(res);
                if(res.data.order_status!='已完成' && res.data.order_status!='待支付'){
                    this.setData({
                        recentOrder: res.data,
                        haveOrder: true
                    })
                }
            },
            fail: (err) => {
                console.error(err)
            }
        })
    },

    // 页面跳转
    goToMyOrder() {
        wx.navigateTo({
            url: '../../My/myOrder/myOrder',
        })
    },
    goToAdmin() {
        wx.navigateTo({
            url: '../../Admin/adminHome/adminHome',
        })
    }
})