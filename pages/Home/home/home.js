// pages/home/home.js
const app = getApp()
const baseUrl = app.globalData.baseUrl

Page({
    data: {
        topBanner: [],
        storeInfo: app.globalData.storeInfo,
        userInfo: app.globalData.userInfo,
    },
    onShareAppMessage: function () {
        return {
            title: '唐合丰面馆，一家独特的重庆拌面馆，快来尝尝吧！',
            path: '/pages/Home/home/home'
        }
    },
    onShow(){
        this.setData({
            storeInfo: app.globalData.storeInfo,
            userInfo: app.globalData.userInfo,
        })
    },
    onLoad() {
        this.getTopBanner();
        app.on('storeInfoUpdated', this.updateInfo);
        app.on('userInfoUpdated', this.updateInfo);
    },
    onUnload() {
        app.off('storeInfoUpdated', this.updateStoreInfo);
        app.off('userInfoUpdated', this.updateInfo);
    },
    updateInfo() {
        this.setData({
            storeInfo: app.globalData.storeInfo,
            userInfo: app.globalData.userInfo
        });
    },

    // 获取轮播图数据
    getTopBanner() {
        wx.request({
            url: baseUrl + 'carousels/',
            success: (res) => {
                if (res.statusCode === 200) {
                    console.log('轮播图数据:', res.data);
                    this.setData({
                        topBanner: res.data
                    });
                } else {
                    console.log('获取轮播图数据失败:', res.errMsg);
                }
            },
            fail: (err) => {
                console.error('请求服务器失败:', err);
            }
        });
    },
    
    // 点击事件
    // changeStores() {
    //     wx.navigateTo({
    //         url: '/pages/Home/store/store',
    //     })
    // },
    eatIn() {
        app.globalData.serviceType = '到店';
        wx.switchTab({
            url: '/pages/Food/food/food'
        })
    },
    eatOut() {
        app.globalData.serviceType = '外卖';
        if (!app.globalData.addressInfo) {
            wx.navigateTo({
                url: '/pages/Home/address/address'
            })
        } else {
            wx.switchTab({
                url: '/pages/Food/food/food'
            })
        }
    },
    goToRegister() {
        wx.navigateTo({
            url: '/pages/My/register/register',
        })
    }
})