let app = getApp();
let windowHeight = 0
let baseUrl = app.globalData.baseUrl

Page({
    data: {
        cartList: [], // 购物车集合

        // 分类栏
        menuArr: [],
        leftActiveNum: 0,
        Tab: 0,
        heightArr: [], //用来存储右侧每个条目的高度
    },

    //获取购物车数据并展示
    onLoad() {
        wx.request({
            url: baseUrl + 'food/getFood',
            method: 'GET', 
            header: {
                'content-type': 'application/json' 
            },
            success: res => {
                let dataList = res.data;
                let processedData = this.processData(dataList);
                this.setData({
                    menuArr: processedData,
                });
                this.getHeightArr(); // 更新高度数组
            },
            fail: error => {
                console.log("菜品数据请求失败", error);
            }
        });
    },
    processData(dataList) {
        let tempArr = [];
        let endData = [];
        dataList.forEach(item => {
            if (tempArr.indexOf(item.fenlei) === -1) {
                endData.push({
                    title: item.fenlei,
                    list: [item]
                });
                tempArr.push(item.fenlei);
            } else {
                for (let j = 0; j < endData.length; j++) {
                    if (endData[j].title == item.fenlei) {
                        endData[j].list.push(item);
                        break;
                    }
                }
            }
        });

        // 对每个分类中的菜品进行销量排序
        endData.forEach(category => {
            category.list.sort((a, b) => b.sell - a.sell);
        });

        // 过滤数组，添加id
        endData.map((item, index) => {
            item.id = index;
        });

        return endData;
    },

    // 分类滚动
    getHeightArr() {
        let _this = this;
        wx.getSystemInfo({
            success: function (res) {
                // 将高度乘以换算后的该设备的rpx与px的比例
                windowHeight = (res.windowHeight * (750 / res.windowWidth)); 
            }
        })
        // 获得每个元素据顶部的高度， 组成一个数组， 通过高度与scrollTop的对比获得目前滑动到那个区域
        let heightArr = [];
        let h = 0;
        //创建节点选择器
        const query = wx.createSelectorQuery();
        //选择id
        query.selectAll('.rightblock').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
            //res就是 所有标签为contlist的元素的信息 的数组
            res[0].forEach((item) => {
                //这里的高度是每个栏目块到顶部的距离
                h += item.height;
                heightArr.push(h);
            })
            _this.setData({
                heightArr: heightArr
            })
        })
    },
    leftClickFn(e) {
        this.setData({
            leftActiveNum: e.target.dataset.myid,
            Tab: e.target.dataset.myid
        })
    },
    rightScrollFn(e) {
        let wucha = 15 //避免部分机型上有问题，给出一个误差范围
        let st = e.detail.scrollTop;
        let myArr = this.data.heightArr;
        for (let i = 0; i < myArr.length; i++) {
            //找出是滚动到了第一个栏目，然后设置栏目选中状态
            if (st >= myArr[i] && st < myArr[i + 1] - wucha) {
                console.log("找到的i", i)
                this.setData({
                    leftActiveNum: i + 1
                });
                return;
            } else if (st < myArr[0] - wucha) {
                this.setData({
                    leftActiveNum: 0
                });
            }
        }
    },

    // 商品上架/下架
    upFood(e) {
        const item = e.currentTarget.dataset.item
        if (item.status === "上架") {
            console.log('已上架，无需重复操作')
        } else {
            console.log('准备去上架');
            let that = this;
            wx.request({
                url: baseUrl + 'food/' + item._id, 
                method: 'PUT',
                data: {
                    status: "上架"
                },
                success(res) {
                    console.log('修改成功', res);
                    that.onLoad(); 
                },
                fail(err) {
                    console.error('修改失败', err);
                }
            });            
        }
    },
    downFood(e) {
        const item = e.currentTarget.dataset.item
        if (item.status === "下架") {
            console.log('已下架，无需重复操作')
        } else {
            console.log('准备去下架')
            let that = this;
            wx.request({
                url: baseUrl + 'food/' + item._id, 
                method: 'PUT',
                data: {
                    status: "下架"
                },
                success(res) {
                    console.log('修改成功', res);
                    that.onLoad(); 
                },
                fail(err) {
                    console.error('修改失败', err);
                }
            });            
        }
    }
})