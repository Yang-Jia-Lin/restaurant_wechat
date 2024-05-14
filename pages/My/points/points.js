import { getPointDetail } from '../../../api/userService';
import { showError } from '../../../utils/tool';
const app = getApp()

Page({
    data: {
        pointsList: []
    },
    onShow() {
        this.getPoints()
    },
    onPullDownRefresh() {

    },

    getPoints() {
        getPointDetail(app.globalData.userInfo.user_id)
            .then(points => {
                this.setData({
                    pointsList: points
                })
            }).catch(err => {
                showError('获取积点出错', err)
            })
    }
})