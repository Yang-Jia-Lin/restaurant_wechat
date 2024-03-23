// pages/phone/phone.js
Page({
    data: {
    },
    Call1() {
        wx.makePhoneCall({
            phoneNumber: '15934101600' 
        })
    },
    Call2() {
        wx.makePhoneCall({
            phoneNumber: '13603510543' 
        })
    },
    Call3() {
        wx.makePhoneCall({
            phoneNumber: '13603510298' 
        })
    },
})