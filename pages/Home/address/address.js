let app = getApp();
let baseUrl = app.globalData.baseUrl

Page({
    data: {
        addressList: [],
        haveAddress: false
    },

    onShow() {
        this.getAddress()
    },

    // 获取地址信息
    getAddress() {
        let addressList = wx.getStorageSync('addressList') || [];
        console.log(this.data.haveAddress)
        if (addressList.length > 0) {
            this.setData({
                addressList: addressList,
                haveAddress: true
            });
        } else {
            this.setData({
                addressList: addressList,
                haveAddress: false
            });
        }
    },

    // 新增地址
    addAddress() {
        wx.navigateTo({
            url: '/pages/Home/addressForm/addressForm',
        })
    },

    // 点击
    delete(e) {
        const index = e.currentTarget.dataset.index;
        let addressList = this.data.addressList;

        addressList.splice(index, 1);
        wx.setStorageSync('addressList', addressList);
        this.getAddress()
    },
    gotoFood(e) {
        app.globalData.addressInfo = e.currentTarget.dataset.item
        console.log(app.globalData.addressInfo)
        wx.switchTab({
            url: '/pages/Food/food/food'
        })
    }
})