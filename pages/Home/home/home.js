// pages/home/home.js
const app = getApp()
const baseUrl = app.globalData.baseUrl

Page({
    data: {
        storeInfo: {
            store_name: "附近门店"
        },
        topBanner: [],
        isUserRegister: app.globalData.isUserRegister,
        userInfo: app.globalData.userInfo
    },
    onLoad() {
        // 用户、轮播图、位置+门店
        this.getUserInfo();
        this.getTopBanner();
        wx.getSetting({
            success: (res) => {
                if (!res.authSetting['scope.userLocation']) {
                    wx.authorize({
                        scope: 'scope.userLocation',
                        success: () => {
                            console.log("设置成功");
                            // 权限授权成功后获取位置信息
                            this.getLocationAndStores();
                        },
                        fail: () => {
                            // 处理用户拒绝授权的情况
                            console.error("用户拒绝授权位置信息");
                        }
                    });
                } else {
                    // 如果已经授权，直接获取位置信息
                    this.getLocationAndStores();
                }
            }
        });
    },

    // 获取用户信息
    getUserInfo() {
        const localUserInfo = wx.getStorageSync('userInfo') || {};
        if (localUserInfo) {
            console.log('首先使用本地用户信息', localUserInfo);
            this.setUserInfo(localUserInfo);
        }
    
        wx.login({
            success: res => {
                if (res.code) {
                    console.log('获取到code:', res.code);
                    const requestUrl = `${app.globalData.baseUrl}users/login`;
                    wx.request({
                        url: requestUrl,
                        method: 'POST',
                        data: {
                            code: res.code
                        },
                        success: res => {
                            if (res.statusCode === 200 && res.data.user) {
                                const serverUserInfo = res.data.user;
                                console.log('从服务器获取到用户信息:', serverUserInfo);
                                this.setUserInfo(serverUserInfo);
                            } else {
                                console.error('服务器获取用户信息失败');
                            }
                        },
                        fail: () => {
                            console.error('请求服务器失败');
                        }
                    });
                } else {
                    console.error('获取code失败: ' + res.errMsg);
                }
            },
            fail: () => {
                console.error('wx.login失败');
            }
        });
    },
    setUserInfo(userInfo) {
        app.globalData.userInfo = userInfo;
        app.globalData.isUserRegister = !!userInfo.phone_number;
        this.setData({
            userInfo: userInfo,
            isUserRegister: !!userInfo.phone_number
        });
        wx.setStorageSync('userInfo', userInfo);
    },
    handleDataFromRegisterPage: function(data) {
        if (data.registered) {
            this.getUserInfo()
        }
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
    // 获取位置信息并获取门店信息
    getLocationAndStores() {
        wx.getLocation({
            type: 'wgs84',
            success: (res) => {
                const latitude = res.latitude;
                const longitude = res.longitude;
                console.log('获取到位置信息', latitude, longitude);
                app.globalData.latitude = latitude;
                app.globalData.longitude = longitude;
                // 获取到位置信息后再获取门店信息
                this.getStores();
            },
            fail: () => {
                console.error("获取位置信息失败");
                this.getStores();
            }
        });
    },
    // 获取门店信息
    getStores() {
        wx.request({
            url: baseUrl + 'stores/',
            method: 'GET',
            data: {
                latitude: app.globalData.latitude,
                longitude: app.globalData.longitude,
            },
            success: (res) => {
                if (res.data.success) {
                    console.log('获取门店信息成功', res.data.stores[0]);
                    app.globalData.stores = res.data.stores;
                    app.globalData.storeInfo = res.data.stores[0];
                    this.setData({
                        storeInfo: res.data.stores[0]
                    });
                }
            },
            fail: (err) => {
                console.log('获取门店信息失败', err);
            }
        });
    },



    // 点击事件
    changeStores() {
        wx.navigateTo({
            url: '/pages/Home/store/store',
        })
    },
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