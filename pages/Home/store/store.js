import { fetchAllStores } from '../../../api/storeService';
import { showError } from './../../../utils/tool';
const app = getApp()

Page({
    data: {
        stores: [],
    },

    onLoad() {
        const lan = app.globalData.latitude;
        const lon = app.globalData.longitude;
        fetchAllStores(lan, lon).then(stores => {
            console.log("所有门店信息：", stores);
            app.globalData.stores = stores;
            app.globalData.storeInfo = stores[0];
            this.setData({
                stores: stores
            });
        }).catch(error => {
            showError("获取门店信息失败", error);
        });
    },

    // 确认选择门店
    selectStore(e) {
        const selectedStore = e.currentTarget.dataset.store;
        console.log('选中的门店信息:', selectedStore);
        app.globalData.storeInfo = selectedStore

        wx.navigateBack({
            delta: 1 // 后退一个页面
        });
    },
});