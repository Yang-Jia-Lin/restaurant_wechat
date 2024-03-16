let app = getApp();
let baseUrl = app.globalData.baseUrl

Page({
    data: {
        HaveOut: app.globalData.HaveOut,
        HaveIn: app.globalData.HaveIn,
        PeopleIn: app.globalData.PeopleIn
    },

    //获取数据
    onLoad() {
        let that = this;
        wx.request({
            url: baseUrl + 'admin/kitchenStatus',
            method: 'GET',
            success: function (res) {
                if (res.statusCode === 200 && res.data) {
                    app.globalData.HaveIn = res.data.dine_in_status;
                    app.globalData.HaveOut = res.data.takeaway_status;
                    app.globalData.PeopleIn = res.data.staff_presence;
                    that.setData({
                        HaveOut: app.globalData.HaveOut,
                        HaveIn: app.globalData.HaveIn,
                        PeopleIn: app.globalData.PeopleIn
                    })
                } else {
                    console.error('Failed to fetch kitchen status:', res.errMsg);
                }
            },
            fail: function (err) {
                console.error('Request failed:', err);
            }
        });
    },

    // 外卖功能上线
    upTakeaway() {
        if (this.data.HaveOut) {
            console.log('已上线，无需重复操作')
        } else {
            console.log('准备去上线');
            this.changeStatus('takeaway_status', true)
        }
    },
    downTakeaway() {
        if (!this.data.HaveOut) {
            console.log('已下线，无需重复操作')
        } else {
            console.log('准备去下线')
            this.changeStatus('takeaway_status', false)
        }
    },
    // 堂食功能上线
    upDinein() {
        if (this.data.HaveIn) {
            console.log('已上线，无需重复操作')
        } else {
            console.log('准备去上线');
            this.changeStatus('dine_in_status', true)
        }
    },
    downDinein() {
        if (!this.data.HaveIn) {
            console.log('已下线，无需重复操作')
        } else {
            console.log('准备去下线')
            this.changeStatus('dine_in_status', false)
        }
    },
    // 店员上下班
    upStaffPresence() {
        if (this.data.PeopleIn) {
            console.log('已上线，无需重复操作')
        } else {
            console.log('准备去上线');
            this.changeStatus('staff_presence', true)
        }
    },
    downStaffPresence() {
        if (!this.data.PeopleIn) {
            console.log('已下线，无需重复操作')
        } else {
            console.log('准备去下线')
            this.changeStatus('staff_presence', false)
        }
    },

    // 访问后端修改状态
    changeStatus(target, status) {
        let that = this
        console.log('Sending data:', { [target]: status }); 
        wx.request({
            url: baseUrl + 'admin/updateKitchenStatus',
            method: 'POST',
            data: {
                [target]: status
            },
            header: {
                'content-type': 'application/json'
            },
            success(res) {
                console.log('修改成功', res);
                that.onLoad(); // 重新加载数据
            },
            fail(err) {
                console.error('修改失败', err);
            }
        });

    }
})