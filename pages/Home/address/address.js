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
        if(addressList!=[]){
            this.setData({
                addressList: addressList,
                haveAddress: true
            });
        }
    },

    // 新增地址
    addAddress(){
        wx.navigateTo({
          url: '/pages/Home/addressForm/addressForm',
        })
    },

    // 去点餐
    gotoFood(){
        wx.switchTab({
            url: '/pages/Food/food/food'
        })
    }
})