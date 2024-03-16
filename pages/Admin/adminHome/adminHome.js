const app = getApp()
const baseUrl = app.globalData.baseUrl
Page({
    data: {
        isAdmin: false,
        username: '',
        password: ''
    },
    // 去订单页
    goHouchu() {
        wx.navigateTo({
            url: '/pages/Admin/adminOrder/adminOrder',
        })
    },
    // 去堂食菜品管理页
    goChange() {
        wx.navigateTo({
            url: '/pages/Admin/adminChange/adminChange',
        })
    },
    // 去外卖菜品管理页
    goOutAdmin() {
        wx.navigateTo({
            url: '/pages/Admin/adminChangeOut/adminChangeOut',
        })
    },
    // 去功能设置页
    goSetting() {
        wx.navigateTo({
            url: '/pages/Admin/adminSetting/adminSetting',
        })
    },

    onLoad() {
        let username = wx.getStorageSync('username') || ''
        let password = wx.getStorageSync('password') || ''
        if (username != '' && password != '') {
            this.login(username, password)
        }
    },
    //管理员登陆相关
    getName: function (e) {
        this.setData({
            username: e.detail.value
        })
    },
    getPassWord: function (e) {
        this.setData({
            password: e.detail.value
        })
    },
    formSubmit: function () {
        if (this.data.username == '' || this.data.username == undefined) {
            wx.showToast({
                title: '用户名不能为空',
                icon: 'none'
            })
            return;
        }
        if (this.data.password == '' || this.data.password == undefined) {
            wx.showToast({
                title: '密码不能为空',
                icon: 'none'
            })
            return;
        }
        this.login(this.data.username, this.data.password)
    },

    //登录
    login(username, password) {
        wx.request({
            url: baseUrl + 'admins/login',
            method: 'POST',
            data: {
                admin_account: username,
                admin_password: password
            },
            success: (res) => {
                console.log("登录ing", res);
                if (res.statusCode === 200) {
                    console.log("登录成功", res);
                    this.setData({
                        isAdmin: true
                    });
                    wx.setStorageSync('username', username);
                    wx.setStorageSync('password', password);
                } else {
                    this.setData({
                        isAdmin: false
                    });
                    wx.showToast({
                        icon: 'none',
                        title: '账号或密码错误',
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    icon: 'none',
                    title: '账号或密码错误',
                });
                this.setData({
                    isAdmin: false
                });
            }
        });
    }

})