/*
 * @Author: zhoudagua
 * @Email: 495144492@qq.com
 * @LastEditors: Zhoudagua
 * @Description: 
 * @Date: 2019-03-12 14:57:13
 * @LastEditTime: 2019-09-02 18:03:11
 */


/**未完成：
 *    1.ws
 *    2.ws获取订单id
 *    
 * */
const app = getApp();
const util = require('../../utils/util.js');
Page({
    data: {
        head_title: ['超值套餐', '零食', '酒水', '水果'], //  菜单内容
        head_choseIdx: 0, //  切换菜单栏
        goodsList: [], //  商品列表
        statusData: {
            isLoading: true,
            isEnd: false,
            isEmpty: false
        },

        hintWindow: false,           //是否显订单提示窗
        succeedWindow: false,        //下单成功弹窗
        // goodsConsumptionId:'',      //订单ID

        isShowCartDetail: true, //  是否显示购物车
        isClicked: false, //    商品是否允许点击添加/减少
        isLoadingCompleted: true,

        cartList: [],
        cartTotal: {
            count: 0,
            total: 0
        },
        tex: "您有新的酒水订单待支付",  //酒水订单状态提示文

        currentPage: 1, // 当前页数
        totalPage: 1    // 总页数
    },
    onLoad: function (options) {
        let that = this;
        app.watch(that.watchDrinks, "consumerGoodsStatus");
        app.watch(that.watchGoods, "consumerUpdateCartItem")
    },
    onShow() {
        this.head_action();
        // 判断酒水状态
        if (app.globalData.consumerGoodsStatus == "order") {
            this.setData({ hintWindow: true, tex: "您有新的酒水订单下单成功" })
        } else if (app.globalData.consumerGoodsStatus == "deliver") {
            this.setData({ hintWindow: true, tex: "您有订单正在配送中..." })
        }
    },
    /**
     * @判断改变酒水状态
     * @data：接收的参数
     * */
    watchDrinks: function (data) {
        if (data == "order") {
            this.setData({ hintWindow: true, tex: "您有新的酒水订单下单成功" })
            util.refreshMyself();
        } else if (data == "deliver") {
            this.setData({ hintWindow: true, tex: "您有订单正在配送中..." })
        }
    },
    /**
     *@判断改购物车状态
     *@data：接收的参数
     * 
     * */
    watchGoods: function (data) {
        var num = 0;
        var isok = false;
        this.setData({ hintWindow: true, tex: "当前购物车发生变动" })
        util.putStorage({
            version: data.version
        }, true);
        switch (data.action) {
            // 添加商品/加数量
            case "add":
                var json = JSON.parse(data.cartItem);
                if (this.data.cartList !== null) {
                    for (let i = 0; i < this.data.cartList.length; i++) {
                        if (this.data.cartList[i].id == json.id) {
                            num = i;
                            isok = true;
                        }
                    }
                    if (isok == true) {
                        this.data.cartList[num].count++;
                        this.data.cartList[num].goodsAmount += json.goodsAmount;
                    } else {
                        this.data.cartList.push(json)
                        this.setData({ cartList: this.data.cartList })
                    }
                    // 循环改变角标的值
                    for (let i = 0; i < this.data.goodsList.length; i++) {
                        if (this.data.goodsList[i].id == json.id) {
                            this.data.goodsList[i].count++
                            this.setData({ goodsList: this.data.goodsList })
                        }
                    }
                    this.data.cartTotal.count++;
                    this.data.cartTotal.total += json.price;
                    this.setData({ cartList: this.data.cartList, cartTotal: this.data.cartTotal })
                } else {
                    this.data.cartList.push(json)
                    this.setData({ cartList: this.data.cartList })
                }
                break;
            // 减数量/删除
            case "reduce":
                var json = JSON.parse(data.cartItem);
                for (let i = 0; i < this.data.cartList.length; i++) {
                    if (this.data.cartList[i].id == json.id) {
                        if (this.data.cartList[i].count == 1) {
                            this.data.cartList.splice(i, 1)
                            if (this.data.cartList.length == 1) {
                                util.refreshMyself();
                                return;
                            }
                        } else {
                            this.data.cartList[i].count--;
                            this.data.cartList[i].goodsAmount -= json.goodsAmount;
                        }
                        this.data.cartTotal.count--;
                        this.data.cartTotal.total -= json.price;
                        this.setData({ cartList: this.data.cartList, cartTotal: this.data.cartTotal })
                    }
                }
                for (let i = 0; i < this.data.goodsList.length; i++) {
                    if (this.data.goodsList[i].id == json.id) {
                        this.data.goodsList[i].count--;
                        this.setData({ goodsList: this.data.goodsList })
                    }
                }
                break;
            // 清空购物车
            case "clear":
                util.refreshMyself();
                break;
        }
    },
    //  先获取商品列表再获取购物车列表，确保购物车中的商品数量正确反显在商品列表上
    getGoodsData() {
        this.getGoodsList().then(value => {
            this.getGoodsCart(value)
        })
    },

    //  获取idx对应的商品列表
    getGoodsList() {
        const tempParam = {
            search_type: '',
            page: this.data.currentPage,
            rows: 20
        };
        try {
            switch (this.data.head_choseIdx) {
                case 0:
                    tempParam.search_type = '1';
                    break;
                case 1:
                    tempParam.search_type = '2';
                    break;
                case 2:
                    tempParam.search_type = '3';
                    break;
                case 3:
                    tempParam.search_type = '4';
                    break;
            };
            return new Promise(resolve => {
                const token = wx.getStorageSync('token')
                util.httpRequest('/manage/businessGoods/findBusinessGoods', tempParam, 'POST', token, data => {
                    console.log(data)
                    if (typeof (data) == 'string') {
                        util.operatingSongCBInfo(data);
                        this.setData({
                            statusData: {
                                isLoading: false,
                                isEnd: false,
                                isEmpty: true
                            }
                        });
                        return;
                    };

                    const tempData = util.getNextPageData(data.data.total, this.data.currentPage, this.data.statusData, data.data.rows, this.data.goodsList);
                    tempData.listData.forEach((val) => {
                        val.count = 0
                    });

                    this.setData({
                        totalPage: tempData.totalPage,
                        statusData: tempData.statusData,
                        goodsList: tempData.listData,
                        isLoadingCompleted: true
                    });
                    resolve(this.data.goodsList)
                })
            })
        } catch (err) {
            console.error(err)
        }
    },

    //  获取redis中购物车列表
    getGoodsCart(goodsList) {
        const token = wx.getStorageSync('token')
        const shoppingCartVersion = wx.getStorageSync('version') ? wx.getStorageSync('version') : 0;
        util.httpRequest('/manage/goodsConsumption/findShoppingCart', {
            version: shoppingCartVersion
        }, 'POST', token, data => {
            //  存储服务器返回的版本号
            // wx.setStorageSync('version', data.data.cart.version);
            util.putStorage({
                version: data.data.cart.version
            }, true);
            const cartList = data.data.cart.cartItems;
            //  遍历购物车中与商品列表中相同名字商品
            if (cartList != null && cartList.length > 0) {
                cartList.forEach((val) => {
                    this.data.cartTotal.count += val.count;
                    this.data.cartTotal.total = data.data.cart.totalAmount;

                    //  设置商品列表中对应商品数量角标
                    goodsList.forEach((val1) => {
                        if (val1.id === val.id && val.count != 0) val1.count = val.count;
                    })
                })
            }

            this.setData({
                goodsList: goodsList,
                cartList: cartList,
                cartTotal: this.data.cartTotal,
                isShowCartDetail: true
            })
        })
    },
    //  切换选项卡
    head_action(ev) {
        if (ev) {
            if (ev.currentTarget.dataset.idx !== this.data.head_choseIdx && this.data.isLoadingCompleted) {
                this.isSetData(ev)
            }
        } else {
            this.isSetData(ev)
        }
    },
    isSetData(ev) {
        this.setData({
            head_choseIdx: ev ? ev.currentTarget.dataset.idx : 0,
            goodsList: [],
            cartList: [],
            cartTotal: {
                count: 0,
                total: 0
            },
            statusData: {
                isLoading: true,
                isEnd: false,
                isEmpty: false
            },
            currentPage: 1, // 当前页数
            totalPage: 1    // 总页数
        });
        this.getGoodsData()
    },
    //  增加/减少/计算商品数量/总价
    changeQuantity(ev) {
        const tempData = ev.currentTarget.dataset;
        const tempRqGoods = {
            id: tempData.id,
            action: tempData.action,
            version: wx.getStorageSync('version') ? wx.getStorageSync('version') : 0
        };
        this.limitMultipleClick(this.setGoodsCart(tempRqGoods));
    },

    //  每次添加或减少均将商品存到redis
    setGoodsCart(goods) {
        const token = wx.getStorageSync('token')
        util.httpRequest('/manage/goodsConsumption/createShoppingCart', goods, 'POST', token, data => {
            if (typeof data === 'string') {
                util.operatingSongCBInfo(data);
                this.setData({
                    isClicked: false
                });
                return
            }

            //  每次修改购物车都需要重新存储版本号
            // wx.setStorageSync('version', data.data.cart.version);
            util.putStorage({
                version: data.data.cart.version
            }, true);

            const cartList = data.data.cart.cartItems;
            let goodsIdArr = [];
            //  将购物车商品id集合
            cartList.forEach((val) => {
                goodsIdArr.push(val.id)
            });

            let count = 0;
            //  购物车减到零时，清空购物车
            if (cartList.length == 0) {
                this.data.goodsList.forEach((val) => {
                    val.count = 0;
                });
                this.data.isShowCartDetail = true
                this.data.cartTotal.total = 0;
            }

            //  购物车增删不为空，不为null情况
            if (cartList !== null && cartList.length > 0) {
                cartList.forEach((val) => {
                    count += val.count;
                    this.data.cartTotal.total = data.data.cart.totalAmount;
                    this.data.goodsList.forEach((val1) => {
                        //  设置不存在购物车列表中的商品的角标数量
                        if (!goodsIdArr.includes(val1.id) && val1.count == 1) {
                            val1.count = 0
                        }
                        //  设置商品列表中对应商品数量角标
                        if (val.id == val1.id) {
                            val1.count = val.count
                        }
                    })
                })
            }
            this.setData({
                isClicked: false,
                isShowCartDetail: this.data.isShowCartDetail,
                cartList: cartList,
                goodsList: this.data.goodsList,
                cartTotal: {
                    count: count,
                    total: this.data.cartTotal.total
                }
            })
        })
    },

    //  商品添加到redis完成前，禁止用户重复/频繁点击
    limitMultipleClick(cb) {
        this.setData({
            isClicked: true
        });
        cb
    },

    //  显示/隐藏购物车
    showCartDetail() {
        if (this.data.cartList !== null) {
            if (this.data.cartList.length != 0 && this.data.cartList != null) {
                if (this.data.isShowCartDetail) {
                    this.setData({
                        isShowCartDetail: false
                    })
                } else {
                    this.setData({
                        isShowCartDetail: true
                    })
                }
            } else {
                wx.showToast({
                    title: '购物车为空，请先选购商品吧 ~',
                    icon: 'none',
                    duration: 2000
                })
            }
        } else {
            wx.showToast({
                title: '购物车为空，请先选购商品吧 ~',
                icon: 'none',
                duration: 2000
            })
        }
    },

    //  清空购物车
    clearCartList() {
        const token = wx.getStorageSync('token')
        util.getLoading().then(() => {
            util.httpRequest('/manage/goodsConsumption/clearShoppingCart', {}, 'POST', token, data => {
                if (data.status_code == 200) {
                    this.data.goodsList.forEach((val) => {
                        val.count = 0;
                    });

                    this.setData({
                        isShowCartDetail: true,
                        cartList: [],
                        goodsList: this.data.goodsList,
                        cartTotal: {
                            count: 0,
                            total: 0
                        }
                    });
                    wx.hideLoading()
                }
            })
        })
    },

    //  创建订单
    creatOrder() {
        const token = wx.getStorageSync('token')
        const shoppingCartVersion = wx.getStorageSync('version') ? wx.getStorageSync('version') : 0;
        util.httpRequest('/manage/goodsConsumption/createOrder', {
            version: shoppingCartVersion
        }, 'POST', token, data => {
            //  解决出现的房间已连接，酒水下单报错的bug
            if (data.data == null) {
                wx.showToast({
                    title: '下单失败，请联系服务员！',
                    icon: 'none',
                    duration: 2000,
                });

                return;
            };
            // this.setData({goodsConsumptionId:data.data.goodsConsumptionId});//,hintWindow:true
            //  检查房间酒水购物车是否有改动
            if (data.data.synchronization == false) {
                data.data.cart.cartItems.forEach((val) => {
                    this.data.cartTotal.count += val.count;
                    this.data.cartTotal.total = data.data.cart.totalAmount
                });

                this.setData({
                    cartList: data.data.cart.cartItems,
                    cartTotal: this.data.cartTotal
                });

                return;
            };
            // 隐藏TabBar
            wx.hideTabBar()
            // 刷新数据
            this.setData({
                succeedWindow: true,
                goodsList: [],
                cartList: [],
                cartTotal: {
                    count: 0,
                    total: 0
                }
            });
            this.getGoodsData();
        })
    },

    //  上拉加载更多
    onReachBottom() {
        if (this.data.totalPage > this.data.currentPage && this.data.totalPage >= 2 && this.data.isLoadingCompleted) {
            this.setData({
                isLoadingCompleted: false
            });
            this.data.currentPage += 1;
            this.getGoodsData()
        }
    },
    // 查看详情
    waitFor() {
        wx.showTabBar()
        wx.navigateTo({
            url: '../mine/drinks/drinks',
        })
        this.setData({
            succeedWindow: false,
            hintWindow: false
        });
        app.globalData.consumerGoodsStatus = "";
    },
    // 我知道了，关闭弹窗
    I_know() {
        wx.showTabBar()
        this.setData({
            succeedWindow: false
        });
    }
})