const app = getApp()
const baseUrl = app.globalData.baseUrl

Page({
    data: {
        stores: app.globalData.stores,
    },

    onShow() {
        this.setData({
            stores: app.globalData.stores
        })
    },

    onLoad() {
        this.getStores()
    },

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
                        stores: res.data.stores
                    });
                }
            },
            fail: (err) => {
                console.log('获取门店信息失败', err);
            }
        });
    },

    // 确认选择门店
    selectStore(e) {
        const selectedStore = e.currentTarget.dataset.store;
        console.log('选中的门店信息:', selectedStore);
        app.globalData.storeInfo = selectedStore

        wx.navigateBack({
            delta: 1 // 后退一个页面
        });
    },
});