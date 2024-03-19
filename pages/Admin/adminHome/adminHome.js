const app = getApp()
const baseUrl = app.globalData.baseUrl
Page({
    data: {
        isAdmin: false,
        username: '',
        password: '',
        adminInfo: {}
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
                        isAdmin: true,
                        adminInfo: res.data
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
    },

    // 页面跳转
    goOrder() {
        wx.navigateTo({
            url: '/pages/Admin/adminOrder/adminOrder',
        })
    },
    goAllOrder(){
        wx.navigateTo({
            url: '/pages/Admin/adminAllOrder/adminAllOrder',
        })
    },
    goDish() {
        wx.navigateTo({
            url: '/pages/Admin/adminDish/adminDish',
        })
    },
    goStore() {
        wx.navigateTo({
            url: '/pages/Admin/adminStore/adminStore',
        })
    },
})