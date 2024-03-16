let app = getApp();
let baseUrl = app.globalData.baseUrl

// 在JS文件中
Page({
    data: {
        phone: '', // 用户输入的电话号码
        name: '', // 用户输入的昵称
        sex: '请选择性别',
        address: '请选择楼栋',
        sexOptions: ['男', '女', '不便透露'],
        addressOptions: ['1栋', '2栋', '3栋'],

        // 其他数据
    },

    // 页面加载时的逻辑
    onLoad() {
        // ...
    },

    // 绑定电话号码输入
    bindPhoneInput: function(e) {
        this.setData({
            phone: e.detail.value
        });
    },

    // 绑定昵称输入
    bindNameInput: function(e) {
        this.setData({
            name: e.detail.value
        });
    },

    // 绑定性别更改
    bindSexChange: function(e) {
        this.setData({
            sex: this.data.sexOptions[e.detail.value]
        });
    },
    bindAddressChange: function(e) {
        this.setData({
            address: this.data.addressOptions[e.detail.value]
        });
    },

    // 添加地址的点击事件
    addAddressClick: function(e) {
        // 现在，phone 和 name 是从数据绑定中获取的
        const formData = {
            phone: this.data.phone,
            name: this.data.name,
            // 其他表单数据
        };

        // 添加新地址到地址列表
        const updatedAddressList = [...this.data.addressList, formData];

        // 更新地址列表
        wx.setStorageSync('addressList', updatedAddressList);
        
        // 其他逻辑
    }
})
