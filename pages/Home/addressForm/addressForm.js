let app = getApp();
let baseUrl = app.globalData.baseUrl

// 在JS文件中
Page({
    data: {
        phone: app.globalData.userInfo.phone_number || '',
        name: app.globalData.userInfo.nickname || '',
        sex: '请选择性别',
        address: '请选择楼栋',
        default: false,
        sexOptions: ['男', '女', '不便透露'],
        addressOptions: [],
    },

    onLoad() {
        this.getAddress();
    },

    getAddress() {
        wx.request({
            url: baseUrl + 'address/',
            success: (res) => {
                if (res.statusCode === 200) {
                    const add = res.data.map(item => item.address_value)
                    this.setData({
                        addressOptions: add
                    });
                } else {
                    console.log('获取数据失败:', res.errMsg);
                }
            },
            fail: (err) => {
                console.error('请求服务器失败:', err);
            }
        });
    },

    // 输入
    bindPhoneInput: function (e) {
        this.setData({
            phone: e.detail.value
        });
    },
    bindNameInput: function (e) {
        this.setData({
            name: e.detail.value
        });
    },

    // 选择
    bindSexChange: function (e) {
        this.setData({
            sex: this.data.sexOptions[e.detail.value]
        });
    },
    bindAddressChange: function (e) {
        this.setData({
            address: this.data.addressOptions[e.detail.value]
        });
    },
    switchChange: function (e) {
        this.setData({
            default: e.detail.value
        });
    },

    // 确认添加地址
    addAddressClick() {
        let formData = {
            phone: this.data.phone,
            name: this.data.name,
            sex: this.data.sex == '请选择性别' ? '' : this.data.sex,
            address_title: '山西省晋中市太原师范学院',
            address_detail: this.data.address,
            default: this.data.default,
        };
        let addressList = wx.getStorageSync('addressList') || []
        let updatedAddressList = []
        // 验证数据合法性
        if (formData.address_detail == '请选择楼栋') {
            wx.showModal({
                title: '提示',
                content: '请选择配送楼栋',
                showCancel: false, // 隐藏取消按钮
                confirmText: '重新检查',
            });
            return;
        }
        if (!formData.phone || formData.phone.length !== 11) {
            wx.showModal({
                title: '提示',
                content: '请输入有效的11位电话号码',
                showCancel: false, // 隐藏取消按钮
                confirmText: '立即选择',
            });
            return;
        }
        // 修改其他地址为非默认地址
        if(formData.default){
            addressList.forEach(address => {
                address.default = false;
            });
            updatedAddressList = [formData , ...addressList];
        } else {
            updatedAddressList = [...addressList, formData];
        }
        
        wx.setStorageSync('addressList', updatedAddressList);
        wx.navigateBack();
    }
})