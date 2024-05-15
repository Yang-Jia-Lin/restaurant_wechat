import { showError } from "../../../utils/tool";
import {
    userSignUp,
    encryptPhone
} from "../../../api/userService"
import { addPoints } from '../../../api/orderService';
import { newInvite, registerInvite } from '../../../api/inviteService';
const app = getApp()

Page({
    data: {
        userInfo: app.globalData.userInfo,
        avatarUrl: app.globalData.userInfo.avatar_url,
        nickname: '微信用户',
        phone: '点击获取'
    },
    onLoad() {
        app.on('userInfoUpdated', this.updateInfo);
        this.getInviter()
    },
    onUnload() {
        app.off('userInfoUpdated', this.updateInfo);
    },
    updateInfo() {
        this.setData({
            userInfo: app.globalData.userInfo
        });
    },

    // 确定分享者
    getInviter() {
        const inviter = wx.getStorageSync('inviter')
        if (inviter) {
            newInvite(inviter, this.data.userInfo.user_id)
                .then(isInvite => {
                    if (isInvite) console.log('aha，新邀请记录创建了')
                    else console.log('hai，你已经在邀请表里了')
                })
                .catch(err => {
                    showError('查看邀请失败', err)
                })
        }
    },

    // 点击事件
    onAvatarChoose() {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 500
        });
    },
    getAvatar(e) {
        const avatarUrl = e.detail.avatarUrl
        console.log(avatarUrl);
        this.setData({
            avatarUrl: avatarUrl,
        })
    },
    onNameInput(e) {
        const value = e.detail.value;
        this.setData({
            nickname: value, // 更新页面数据
        });
        console.log('获取到昵称', this.data.nickname)
    },
    onPhoneClick() {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 1000
        });
    },
    getPhoneNumber(e) {
        // 用户同意授权
        if (e.detail.errMsg === 'getPhoneNumber:ok') {
            wx.showLoading({
                title: '加载中',
            });
            wx.login({
                success: res => {
                    wx.hideLoading();
                    if (res.code) {
                        encryptPhone(res.code, e.detail.encryptedData, e.detail.iv).then(phoneNumber => {
                            this.setData({
                                phone: phoneNumber
                            })
                        }).catch(err => {
                            showError('解密失败', err)
                        })
                    } else {
                        showError('登录失败', res.errMsg)
                    }
                }
            });
        }
        // 用户拒绝
        else {
            showError('获取失败')
        }
    },

    // 注册相关
    onRegisterClick() {
        const phone = this.data.phone
        if (phone == "点击获取" || phone.length != 11)
            showError('手机号无效！')
        else {
            this.register()
        }
    },
    register() {
        const userId = this.data.userInfo.user_id
        const phone = this.data.phone
        const name = this.data.nickname
        const avatar = this.data.avatarUrl

        wx.showLoading({
            title: '加载中',
        })
        userSignUp(userId, phone, name, avatar).then(user => {
            this.setData({
                userInfo: user
            });
            app.trigger('userInfoUpdated');
            app.globalData.userInfo = user;
            wx.setStorageSync('userInfo', user);
            this.addRegisterPoints()
            this.updateInviteInfo()
        }).catch(err => {
            wx.hideLoading()
            showError('注册失败', err)
        })
    },
    addRegisterPoints() {
        addPoints(app.globalData.userInfo.user_id, 2, '注册赠送')
            .then(user => {
                app.globalData.userInfo = user
                app.trigger('userInfoUpdated');
                wx.setStorageSync('userInfo', user);
                wx.showModal({
                    title: '注册成功',
                    content: '两个积点已经发放至您的账户！',
                    showCancel: false,
                    success: function () {
                        wx.navigateBack()
                    }
                })
                wx.hideLoading()
            }).catch(err => {
                showError('积点赠送失败', err)
                wx.hideLoading()
            })
    },
    updateInviteInfo() {
        if (wx.getStorageSync('inviter')) {
            registerInvite(this.data.userInfo.user_id)
                .then(isInvite => {
                    if (isInvite)
                        console.log('更新邀请成功')
                    else
                        console.log('没有邀请信息')
                })
                .catch(err => {
                    showError('更新邀请失败', err)
                })
        }
    }

})