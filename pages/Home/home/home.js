import { fetchTopBanner } from './../../../api/storeService';
import { showError } from './../../../utils/tool';
const app = getApp()

Page({
    data: {
        topBanner: [],
        storeInfo: app.globalData.storeInfo,
        userInfo: app.globalData.userInfo,
        dialogVisible1: false,
        dialogVisible2: false
    },
    onShow() {
        this.updateUser()
    },
    onLoad(options) {
        const inviter = wx.getStorageSync('inviter');
        if (options.referrer && !inviter) {
            wx.setStorageSync('inviter', options.referrer);
            console.log('当前邀请者', options.referrer)
        }
        //console.log('当前邀请者', wx.getStorageSync('inviter'))
        // wx.setStorageSync('inviter', 16);
        // console.log('假的邀请者', wx.getStorageSync('inviter'))

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
        if (user.points > 0) {
            this.setData({
                dialogVisible1: false,
                dialogVisible2: true
            })
        } else {
            this.setData({
                dialogVisible1: true,
                dialogVisible2: false
            })
        }
    },

    // 分享
    onShareButtonClick: function () {
        const tmplIds = ['shRFentLzPN-2o1F3Om1mkYJkbCZXCQUSiZyrf0isns'];
        wx.requestSubscribeMessage({
            tmplIds: tmplIds,
            success: res => {
                console.log('订阅消息授权结果:', res);
            },
            complete: () => {
                this.onShareAppMessage();
            }
        });
    },
    onShareAppMessage: function () {
        return {
            title: '唐合丰面馆，一家独特的重庆拌面馆，快来尝尝吧！',
            path: '/pages/Home/home/home?referrer=' + this.data.userInfo.user_id,
            success: shareRes => {
                console.log('分享成功', shareRes);
            },
            fail: shareErr => {
                console.log('分享失败', shareErr);
            }
        };
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
    changeStores() {
        wx.showModal({
            title: '提示',
            content: '门店扩展中，敬请期待！',
            showCancel: false,
            success: () => {
                return
            }
        })
        // wx.navigateTo({
        //     url: '/pages/Home/store/store',
        // })
    },
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

    // 广告
    toggleDialog(e) {
        console.log(e)
        if (e.currentTarget.dataset.id == "1") {
            this.setData({
                dialogVisible1: !this.data.dialogVisible1
            });
        } else {
            this.setData({
                dialogVisible2: !this.data.dialogVisible2
            });
        }

    }
})