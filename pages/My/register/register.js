const app = getApp()
const baseUrl = app.globalData.baseUrl

Page({
    data: {
        userInfo: app.globalData.userInfo,
        avatarUrl: app.globalData.userInfo.avatar_url,
        nickname: '微信用户',
        phone: '点击获取',
        isHavePhone: false
    },
    // 获取头像
    onChooseAvatar(e) {
        const {
            avatarUrl
        } = e.detail
        console.log(avatarUrl);
        this.setData({
            ['userInfo.avatarUrl']: avatarUrl,
        })
        this.setData({
            avatarUrl: e.detail,
        })

    },
    // 获取昵称
    onInput(e) {
        const value = e.detail.value;
        this.setData({
            nickname: value, // 更新页面数据
        });
        console.log('获取到昵称', this.data.nickname)
    },
    // 获取并解密手机号码
    getPhoneNumber(e) {
        if (e.detail.errMsg === 'getPhoneNumber:ok') {
            // 用户同意授权获取手机号，发送加密信息到后端解密
            wx.login({
                success: res => {
                    if (res.code) {
                        wx.request({
                            url: app.globalData.baseUrl + 'users/phone',
                            method: 'POST',
                            data: {
                                code: res.code,
                                encryptedData: e.detail.encryptedData,
                                iv: e.detail.iv // 加密算法的初始向量
                            },
                            success: (res) => {
                                if (res.data.success) {
                                    console.log('解密后的手机号码信息:', res.data.data);
                                    this.setData({
                                        phone: res.data.data.phoneNumber,
                                        isHavePhone: true
                                    })
                                } else {
                                    console.error('解密失败:', res.data.message);
                                }
                            },
                            fail: (error) => {
                                console.error('请求后端接口失败:', error);
                            }
                        });
                    } else {
                        console.error('登录失败！' + res.errMsg);
                    }
                }
            });
        } else {
            // 用户拒绝授权，处理逻辑
            console.error('用户拒绝授权获取手机号');
        }
    },


    // 注册
    getRegister() {
        let that = this
        let points = (parseFloat(that.data.userInfo.points) + 2).toFixed(2)
        if (this.data.phone === "点击获取" || this.data.phone.length != 11) {
            wx.showModal({
                title: '提示',
                content: '请先获取正确的电话号码',
                showCancel: false, // 隐藏取消按钮
            })
            return;
        } else {
            wx.request({
                url: baseUrl + 'users/' + this.data.userInfo.user_id,
                method: 'PUT',
                data: {
                    phone_number: that.data.phone,
                    nickname: that.data.nickname,
                    points: points
                },
                success: (res) => {
                    if (res.statusCode === 200) {
                        console.log('注册成功', res.data);
                        this.setUserInfo(res.data.updatedUser)
                        wx.showModal({
                            title: '提示',
                            content: '注册成功！',
                            showCancel: false,
                            success: function () {
                                const pages = getCurrentPages(); 
                                const prevPage = pages[pages.length - 2]; 
                                if (prevPage) {
                                    if (typeof prevPage.handleDataFromRegisterPage === 'function') {
                                        prevPage.handleDataFromRegisterPage({
                                            registered: true
                                        });
                                    }
                                }
                                wx.navigateBack()
                            }
                        })
                    } else {
                        console.log('注册失败:', res.errMsg);
                        wx.showModal({
                            title: '提示',
                            content: '注册失败，请重试或联系工作人员！',
                            showCancel: false, // 隐藏取消按钮
                        })
                        return;
                    }
                },
                fail: (err) => {
                    console.error('请求服务器失败:', err);
                    wx.showModal({
                        title: '提示',
                        content: '注册失败，请重试或联系工作人员！',
                        showCancel: false, // 隐藏取消按钮
                    })
                    return;
                }
            });
        }
    },
    setUserInfo(userInfo) {
        app.globalData.userInfo = userInfo;
        this.setData({
            userInfo: userInfo,
            isUserRegister: !!userInfo.phone_number
        });
        wx.setStorageSync('userInfo', userInfo);
    }
})