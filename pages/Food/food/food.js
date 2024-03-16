let app = getApp();
let windowHeight = 0
let baseUrl = app.globalData.baseUrl

Page({
    data: {
        storeInfo: app.globalData.storeInfo || {
            store_name: "附近门店"
        },
        serviceType: app.globalData.serviceType,
        addressInfo: app.globalData.addressInfo,
        dishList: [],
        cartList: wx.getStorageSync('cart') || [],
        totalPrice: 0,
        totalNum: 0,

        // 当前选择
        currentDish: {}, // 一个主菜
        currentMandatory: wx.getStorageSync('mandatory') || {
            主食: "面",
            辣度: "微辣",
            麻度: "微麻",
            份量: "标准"
        }, // 一组必选
        currentOptional: [], // 一组多选
        currentEatType: '堂食',
        currentSmallDish: [], // 多个小菜

        // 分类滚动
        menuArr: [],
        leftActiveNum: 0,
        Tab: 0,
        heightArr: [], //用来存储右侧每个条目的高度

        // 购物车动画
        animationData: {},
        animationMask: {},
        maskVisual: "hidden",
        maskFlag: true,

        // 选规格动画
        animationData2: {},
        animationMask2: {},
        maskVisual2: "hidden",
        maskFlag2: true,
    },

    onShow() {
        this.getCartList()
        this.setData({
            storeInfo: app.globalData.storeInfo,
            serviceType: app.globalData.serviceType,
            addressInfo: app.globalData.addressInfo
        })
    },

    onLoad() {
        if (!app.globalData.storeInfo) {
            this.getStores()
        } else {
            this.getFoodList()
        }
    },

    // 1.门店信息相关
    getStores() {
        let that = this;
        wx.request({
            url: baseUrl + 'stores/',
            method: 'GET',
            data: {
                latitude: app.globalData.latitude,
                longitude: app.globalData.longitude,
            },
            success: (res) => {
                if (res.data.success) {
                    console.log('获取门店信息成功', res.data.stores[0]);
                    app.globalData.stores = res.data.stores;
                    app.globalData.storeInfo = res.data.stores[0];
                    this.setData({
                        storeInfo: res.data.stores[0]
                    })
                    that.getFoodList()
                }
            },
            fail: (err) => {
                console.log('获取门店信息失败', err);
            }
        });
    },
    changeStores() {
        wx.navigateTo({
            url: '/pages/Home/store/store',
        })
    },

    // 2.切换serviceType
    onServiceTypeChange(e) {
        this.setData({
            serviceType: e.detail.value
        });
        app.globalData.serviceType = e.detail.value
        console.log('单选按钮发生变化，当前选中:', app.globalData.serviceType);
        if (e.detail.value == "外卖") {
            // 选择地址
            if (!app.globalData.addressInfo) {
                wx.navigateTo({
                    url: '/pages/Home/address/address'
                })
            }
            // 修改eatType
            this.setData({
                currentEatType: '打包'
            })
        }
    },

    // 3.更新购物车
    getCartList() {
        var cartList = wx.getStorageSync('cart') || [];
        var totalP = 0;
        var totalN = 0
        for (var i in cartList) { // 循环列表得到每个数据
            totalP += cartList[i].quantity * cartList[i].price;
            totalN += cartList[i].quantity
        }
        this.setData({
            cartList: cartList,
            totalNum: totalN,
            totalPrice: totalP.toFixed(2)
        });
        console.log('当前购物车', cartList)
    },

    // 4.获取菜品数据
    getFoodList() {
        wx.request({
            url: baseUrl + 'dishes/store-dishes/',
            method: 'GET',
            data: {
                storeId: app.globalData.storeInfo.store_id,
                serviceType: app.globalData.serviceType,
                dish_status: '上架'
            },
            success: res => {
                if (res.data.success) {
                    let dishes = res.data.storeDishes.map(item => item.dish);
                    let existingDishIds = new Set(dishes.map(dish => dish.dish_id));

                    this.cleanUpCart(existingDishIds); // 清理购物车
                    let menuArr = this.processData(dishes); // 过滤分类
                    this.updateDishQuantities(dishes); // 更新已选数量
                    this.getHeightArr(); // 更新高度数组

                    this.setData({
                        dishList: dishes,
                        menuArr: menuArr,
                    });

                    console.log("菜品数据：", dishes, "过滤：", menuArr);
                } else {
                    console.log("菜品数据请求失败", res);
                }
            },
            fail: error => {
                console.log("菜品数据请求失败", error);
            }
        });
    },
    cleanUpCart(existingDishIds) { // 清理购物车中不存在的菜品
        let cartList = wx.getStorageSync('cart') || [];
        cartList = cartList.filter(item => existingDishIds.has(item.dish_id));
        wx.setStorageSync('cart', cartList);
    },
    processData(dataList) { // 处理菜品数据
        let categoryMap = new Map();
        dataList.forEach(food => {
            let category = categoryMap.get(food.category_id) || {
                title: food.category.category_name,
                list: []
            };
            category.list.push(food);
            categoryMap.set(food.category_id, category);
        });

        // 分类中按照销量排序
        let endData = Array.from(categoryMap.values()).map(category => {
            category.list.sort((a, b) => b.sales - a.sales);
            return category;
        });
        // 分类按照分类id排序
        endData.sort((a, b) => a.list[0].category_id - b.list[0].category_id).forEach((item, index) => {
            item.id = index;
        });

        return endData;
    },
    updateDishQuantities(dataList) { // 更新主界面的已选购菜品数量
        let cartList = wx.getStorageSync('cart') || [];
        dataList.forEach(food => {
            food.quantity = 0; // 初始化为0
            let cartItem = cartList.find(cart => cart.dish_id === food.dish_id);
            if (cartItem) {
                food.quantity = cartItem.quantity;
            }
        });
    },


    // 5.购物车操作
    minusCount(e) {
        let item = e.currentTarget.dataset.item;
        let cartList = wx.getStorageSync('cart') || [];
        let menuArr = this.data.menuArr
        // menuArr菜品 v每个分类 v2每个菜品
        menuArr.forEach(v => {
            v.list.forEach(v2 => {
                if (v2.dish_id == item.dish_id) {
                    // 修改菜品列表中该菜品的数量
                    v2.quantity = v2.quantity > 0 ? v2.quantity - 1 : 0;

                    // 修改购物车中该菜品的数量
                    for (let j = 0; j < cartList.length; j++) {
                        if (cartList[j].dish_id == item.dish_id && cartList[j].eat_type == item.eat_type &&
                            JSON.stringify(cartList[j].mandatory_options) === JSON.stringify(item.mandatory_options) &&
                            JSON.stringify(cartList[j].optional_options) === JSON.stringify(item.optional_options)) {
                            cartList[j].quantity -= 1;
                            if (cartList[j].quantity <= 0) {
                                cartList.splice(j, 1);
                                j--; // 后续元素索引向前移动，需要减少索引j
                            }
                            break;
                        }
                    }

                    if (cartList.length <= 0) {
                        this.setData({
                            cartList: [],
                            totalNum: 0,
                            totalPrice: 0,
                        })
                        this.cascadeDismiss()
                    }
                    wx.setStorageSync('cart', cartList)
                }
            })
        })
        this.setData({
            cartList: cartList,
            menuArr: menuArr
        })
        this.getCartList();
    },
    addCount(e) {
        let item = e.currentTarget.dataset.item;
        let arr = wx.getStorageSync('cart') || [];
        let flag = false;
        let menuArr = this.data.menuArr
        menuArr.forEach(v => {
            v.list.forEach(v2 => {
                if (v2.dish_id == item.dish_id) {
                    // 菜品数据当前菜品+1
                    v2.quantity += 1;
                    // 购物车当前菜品+1
                    if (arr.length > 0) {
                        for (let j in arr) {
                            if (arr[j].dish_id == item.dish_id &&
                                arr[j].eat_type == item.eat_type && JSON.stringify(arr[j].mandatory_options) === JSON.stringify(item.mandatory_options) && JSON.stringify(arr[j].optional_options) === JSON.stringify(item.optional_options)) {
                                arr[j].quantity += 1;
                                flag = true;
                                wx.setStorageSync('cart', arr)
                                break;
                            }
                        }
                        if (!flag) arr.push(v2);
                    } else arr.push(v2);
                    wx.setStorageSync('cart', arr)
                }
            })
        })

        this.setData({
            cartList: arr,
            menuArr: menuArr
        })
        this.getCartList();
    },
    deleteOne(e) {
        var dish = e.currentTarget.dataset.dish;
        var index = e.currentTarget.dataset.index;
        var arr = wx.getStorageSync('cart')
        let menuArr = this.data.menuArr
        menuArr.forEach(v => {
            v.list.forEach(v2 => {
                if (v2.dish_id == dish.dish_id) {
                    v2.quantity -= dish.quantity;
                }
            })
        })

        arr.splice(index, 1);
        if (arr.length <= 0) {
            this.setData({
                menuArr: menuArr,
                cartList: [],
                totalNum: 0,
                totalPrice: 0,
            })
            this.cascadeDismiss()
        }
        wx.setStorageSync('cart', arr)
        this.setData({
            cartList: arr,
            menuArr: menuArr
        })
        this.getCartList();
    },
    cleanList() {
        let menuArr = this.data.menuArr
        menuArr.forEach(v => {
            v.list.forEach(v2 => {
                v2.quantity = 0
            })
        })
        wx.setStorageSync('cart', "")
        this.setData({
            menuArr: menuArr,
            cartList: [],
            totalNum: 0,
            totalPrice: 0,
        })
        this.cascadeDismiss()
    },


    // 6.菜品详情操作
    onEatTypeChange(e) {
        this.setData({
            currentEatType: e.currentTarget.dataset.option
        });
    },
    onMandatoryOptionChange(e) {
        let name = e.currentTarget.dataset.name;
        let value = e.currentTarget.dataset.option;
        let currentMandatory = this.data.currentMandatory;
        currentMandatory[name] = value;
        this.setData({
            currentMandatory: currentMandatory
        });
    },
    onOptionalOptionChange(e) {
        let values = e.detail.value;
        this.setData({
            currentOptional: values
        });
    },
    onSmallDishChange(e) {

    },
    addToCart() {
        let currentDish = this.data.currentDish;
        let currentMandatory = this.data.currentMandatory;
        let currentOptional = this.data.currentOptional;
        let currentEatType = this.data.currentEatType;
        let values = Object.values(this.data.currentMandatory);
        wx.setStorageSync('mandatory', currentMandatory);

        // 准备插入数据
        let item = {};
        item.dish_id = currentDish.dish_id;
        item.dish_name = currentDish.dish_name;
        item.price = currentDish.price;
        item.quantity = currentDish.quantity;
        item.eat_type = currentEatType;
        item.mandatory_options = currentMandatory;
        item.mandatory_values = values;
        item.optional_options = currentOptional;
        console.log('c', item)

        let arr = wx.getStorageSync('cart') || [];
        let f = false;
        let menuArr = this.data.menuArr
        // 更新菜单中菜品数量
        menuArr.forEach(v => {
            v.list.forEach(v2 => {
                if (v2.dish_id == item.dish_id) {
                    v2.quantity += 1;
                }
            })
        })

        // 更新购物车中菜品数量
        if (arr.length > 0) {
            for (let j in arr) {
                if (arr[j].dish_id === item.dish_id &&
                    arr[j].eat_type == item.eat_type &&
                    JSON.stringify(arr[j].mandatory_options) === JSON.stringify(item.mandatory_options) &&
                    JSON.stringify(arr[j].optional_options) === JSON.stringify(item.optional_options)) {
                    arr[j].quantity += 1;
                    f = true;
                    break;
                }
            }
            if (!f) {
                item.quantity = 1;
                arr.push(item);
            }
        } else {
            item.quantity = 1;
            arr.push(item);
        }

        // 保存数据
        wx.setStorageSync('cart', arr)
        this.setData({
            cartList: arr,
            menuArr: menuArr
        })
        this.goDetailDismiss()
        wx.showToast({
            title: '加购成功！',
        })
        this.getCartList();
    },


    // 7.确认结算
    gotoOrder: function () {
        var arr = wx.getStorageSync('cart') || [];
        if (!arr || arr.length == 0) {
            wx.showModal({
                title: '提示',
                content: '请选择菜品',
                showCancel: false, // 隐藏取消按钮
            })
            return;
        }
        if (this.data.serviceType == '外卖' && !this.data.addressInfo) {
            wx.showModal({
                title: '提示',
                content: '请选择配送地址',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/Home/address/address',
                        })
                    } else if (res.cancel) {
                        return;
                    }
                }
            });
        } else {
            wx.navigateTo({
                url: '/pages/Food/pay/pay'
            })
        }
    },






    // 界面分类滚动
    getHeightArr() {
        let _this = this;
        wx.getSystemInfo({
            success: function (res) {
                //将高度乘以换算后的该设备的rpx与px的比例
                windowHeight = (res.windowHeight * (750 / res.windowWidth));
            }
        })
        // 获得每个元素据顶部的高度组成数组
        // 通过高度与scrollTop的对比来获取目前滑动到哪个区域
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
        let wucha = 15 // 避免机型有问题，给出一个误差范围
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

    // 购物车开关
    cascadeToggle: function () {
        var that = this;
        var arr = this.data.cartList
        if (arr.length > 0) {
            if (that.data.maskVisual == "hidden") {
                that.cascadePopup()
            } else {
                that.cascadeDismiss()
            }
        } else {
            that.cascadeDismiss()
        }
    },
    cascadePopup: function () {
        var that = this;
        // 购物车打开动画
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: 'ease-in-out',
            delay: 0
        });
        that.animation = animation;
        animation.translate(0, -385).step();
        that.setData({
            animationData: that.animation.export(),
        });
        // 遮罩渐变动画
        var animationMask = wx.createAnimation({
            duration: 200,
            timingFunction: 'linear',
        });
        that.animationMask = animationMask;
        animationMask.opacity(0.8).step();
        that.setData({
            animationMask: that.animationMask.export(),
            maskVisual: "show",
            maskFlag: false,
        });
    },
    cascadeDismiss: function () {
        var that = this
        // 购物车关闭动画
        that.animation.translate(0, 285).step();
        that.setData({
            animationData: that.animation.export()
        });
        // 遮罩渐变动画
        that.animationMask.opacity(0).step();
        that.setData({
            animationMask: that.animationMask.export(),
        });
        // 隐藏遮罩层
        that.setData({
            maskVisual: "hidden",
            maskFlag: true
        });
    },

    // 详情页开关
    goDetailToggle: function (e) {
        let that = this;
        if (that.data.maskVisual2 == "hidden") {
            console.log('当前菜品', e.currentTarget.dataset.item)
            that.setData({
                currentDish: e.currentTarget.dataset.item,
            })
            let options = that.data.currentDish.optional_options;
            that.setData({
                currentOptional: options
            })
            that.goDetailPopup()
        } else
            that.goDetailDismiss()
    },
    goDetailPopup: function () {
        var that = this;
        // 购物车打开动画
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: 'ease-in-out',
            delay: 0
        });
        that.animation = animation;
        animation.translate(0, -675).step();
        that.setData({
            animationData2: that.animation.export(),
        });
        // 遮罩渐变动画
        var animationMask2 = wx.createAnimation({
            duration: 200,
            timingFunction: 'linear',
        });
        that.animationMask2 = animationMask2;
        animationMask2.opacity(0.8).step();
        that.setData({
            animationMask2: that.animationMask2.export(),
            maskVisual2: "show",
            maskFlag2: false,
        });
    },
    goDetailDismiss: function () {
        var that = this
        // 购物车关闭动画
        that.animation.translate(0, 285).step();
        that.setData({
            animationData2: that.animation.export()
        });
        // 遮罩渐变动画
        that.animationMask2.opacity(0).step();
        that.setData({
            animationMask2: that.animationMask2.export(),
        });
        // 隐藏遮罩层
        that.setData({
            maskVisual2: "hidden",
            maskFlag2: true,
            currentDish: {}
        });
    }
})