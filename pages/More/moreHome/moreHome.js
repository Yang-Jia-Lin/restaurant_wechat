Page({
    data: {
        menuItems: ['会员服务条款', '隐私保护', '积点使用规则', '优惠券使用规则', '充值服务规则']
    },
    onMenuItemTap: function (e) {
        const index = e.currentTarget.dataset.index
        console.log('Clicked item:', e.currentTarget.dataset.item);
        console.log('Item index:', e.currentTarget.dataset.index);
        switch (index) {
            case 0:
                wx.navigateTo({
                    url: '../more1/more1',
                })
                break
            case 1:
                wx.navigateTo({
                    url: '../more2/more2',
                })
                break
            case 2:
                wx.navigateTo({
                    url: '../more3/more3',
                })
                break
            case 3:
                wx.showModal({
                    title: '提示',
                    content: '功能开发中，敬请期待！',
                    showCancel: false,
                    success: () => {
                        return
                    }
                })
                break
            // wx.navigateTo({
            //     url: '../more4/more4',
            // })
            case 4:
                wx.showModal({
                    title: '提示',
                    content: '功能开发中，敬请期待！',
                    showCancel: false,
                    success: () => {
                        return
                    }
                })
                break
            // wx.navigateTo({
            //     url: '../more5/more5',
            // })
        }
    }
})