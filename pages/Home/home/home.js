import { fetchTopBanner } from './../../../api/storeService';
import { showError } from './../../../utils/tool';
const app = getApp()

Page({
    data: {
        topBanner: [],
        storeInfo: app.globalData.storeInfo,
        userInfo: app.globalData.userInfo,
        dialogVisible: false
    },
    onShareAppMessage: function () {
        return {
            title: '唐合丰面馆，一家独特的重庆拌面馆，快来尝尝吧！',
            path: '/pages/Home/home/home'
        }
    },
    onShow() {
        this.updateUser()
    },
    onLoad() {
        this.getTopBanner();
        app.on('storeInfoUpdated', this.updateStore);
        app.on('userInfoUpdated', this.updateUser);
    },
    onUnload() {
        app.off('storeInfoUpdated', this.updateStore);
        app.off('userInfoUpdated', this.updateUser);
    },
    updateStore() {
        this.setData({
            storeInfo: app.globalData.storeInfo
        });
    },
    updateUser() {
        const user = app.globalData.userInfo
        this.setData({
            userInfo: user
        });
        if (!user.phone_number) {
            this.setData({
                dialogVisible: true
            })
        } else {
            this.setData({
                dialogVisible: false
            })
        }
    },

    // 获取轮播图数据
    getTopBanner() {
        fetchTopBanner().then(imageUrls => {
            console.log("轮播图信息：", imageUrls);
            this.setData({
                topBanner: imageUrls
            })
        }).catch(error => {
            showError("获取轮播图失败", error);
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
        wx.navigateTo({
            url: '/pages/Home/address/address'
        })
    },
    goToRegister() {
        wx.navigateTo({
            url: '/pages/My/register/register',
        })
    },

    toggleDialog: function () {
        this.setData({
            dialogVisible: !this.data.dialogVisible
        });
    }
})