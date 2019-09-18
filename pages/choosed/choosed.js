/*
 * @Author: zhoudagua
 * @Email: 495144492@qq.com
 * @Date: 2018-12-25 17:49:11
 * @LastEditors: Zhoudagua
 * @LastEditTime: 2019-09-10 11:17:04
 * @Description: 
 */
const app = getApp();
const util = require('../../utils/util.js');

Page({
    data: {
        head_title: ['已点歌曲', '已唱歌曲'], //  菜单内容

        isLoadingCompleted: true,
        selectedData: {
            head_selectedIdx: 0, //  切换菜单栏
            isNeedRecording: true,
            isNeedAdd: true,
            isShowScore: false,
            isCol: false,
            isAdd: false,
            isTop: true,
        },

        isClicked: false,
        isRepeat: true,
        isRefresh: true,

        statusData: {
            isLoading: true,
            isEnd: false,
            isEmpty: false
        },
        listData: [], //  歌手列表
        currentPage: 1,
        totalPage: 1,
        playedSongs: '', //正在播放歌曲
        acplayed: '', //正在播放状态
    },
    onLoad: function (options) {
        let that = this;
        app.watch(that.playedSongs, "consumerPlayedSongs");
        app.watch(that.watchsong, "songs");
    },
    onShow() {
        console.log(app.globalData.consumerPlayedSong)
        if (app.globalData.consumerPlayedSong !== '') {
            this.setData({
                acplayed: 1,
                playedSongs: app.globalData.consumerPlayedSong
            })
        }
        this.processSelectedData(this.data.selectedData.head_selectedIdx)
    },
    /**
     *  @description: 正在播放的歌曲歌手
     */
    playedSongs: function (data) {
        // console.log(data)
        if (data.action == 'played') {
            this.setData({
                acplayed: 1,
                playedSongs: data

            })
            // console.log(this.data.playedSongs,this.data.acplayed,'正在播放')
        } else {
            this.setData({
                acplayed: 0,
                playedSongs: '当前无正在播放歌曲，快去点歌吧'
            })
            // console.log(this.data.playedSongs,this.data.acplayed,'无正在播放歌曲')
        }

    },

    /**
     *  @description: 切换选项卡
     */
    head_action(ev) {
        if (ev) {
            if (ev.currentTarget.dataset.idx !== this.data.selectedData.head_selectedIdx) {
                const idx = ev.currentTarget.dataset.idx;
                this.processSelectedData(idx)
            }
        } else {
            const idx = ev.currentTarget.dataset.idx;
            this.processSelectedData(idx)
        }
    },
    /**
     * @判断歌曲数据
     * @data：接收数据，刷新页面
     * */
    watchsong: function (data) {
        if (data && this.data.isRefresh) {
            util.refreshMyself();
        }
    },

    //  根据选项卡操作
    processSelectedData(idx) {
        const tempSelectedData = {};
        switch (idx) {
            case 0:
                tempSelectedData.head_selectedIdx = 0;
                tempSelectedData.isCol = false;
                tempSelectedData.isAdd = false;
                tempSelectedData.isTop = true;
                tempSelectedData.isNeedRecording = true;
                tempSelectedData.isNeedAdd = true;
                tempSelectedData.isShowScore = false;
                break;
            case 1:
                tempSelectedData.head_selectedIdx = 1;
                tempSelectedData.isCol = true;
                tempSelectedData.isAdd = false;
                tempSelectedData.isTop = false;
                tempSelectedData.isNeedRecording = false;
                tempSelectedData.isNeedAdd = false;
                tempSelectedData.isShowScore = true;
                break;
        };
        //  设置idx对应的歌单状态
        this.setData({
            isRepeat: true,
            selectedData: tempSelectedData,
            statusData: {
                isLoading: true,
                isEnd: false,
                isEmpty: false
            },
            listData: [],
            currentPage: 1,
            totalPage: 1
        });
        //  获取idx对应歌单
        this.getChoosedList()
    },

    /**
     * @description: 返回选项卡获取已点/已唱/收藏歌单的参数
     */
    getParams(head_selectedIdx) {
        const temp = {
            url: '',
            tempParam: {
                rows: 20,
                page: this.data.currentPage
            }
        };
        switch (head_selectedIdx) {
            case 0:
            case 1:
                temp.url = '/manage/songs/getSongsAlready';
                temp.tempParam.type = head_selectedIdx == 0 ? '1' : '2'
                break;
            case 2:
                temp.url = '/manage/collectSongs/findCollectSongs';
                break;
        };
        return temp;
    },

    /**
     * @description: 切换选项卡获取已点/已唱/收藏歌单
     */
    getChoosedList() {
        const token = wx.getStorageSync('token');
        const tempParam = this.getParams(this.data.selectedData.head_selectedIdx);
        //  获取新歌单
        if (this.data.isRepeat) {
            this.setData({
                isRepeat: false,
                isRefresh: false
            });
            util.httpRequest(tempParam.url, tempParam.tempParam, 'POST', token, data => {
                if (data.status_code == 200) {
                    const tempData = util.getNextPageData(data.data.total, this.data.currentPage, this.data.statusData, data.data.rows, this.data.listData);
                    this.setData({
                        totalPage: tempData.totalPage,
                        statusData: tempData.statusData,
                        listData: tempData.listData,
                        isLoadingCompleted: true,
                        isRepeat: true,
                        isRefresh: true
                    })
                } else {
                    util.operatingSongCBInfo(data);
                    this.setData({
                        statusData: {
                            isLoading: false,
                            isEnd: false,
                            isEmpty: true,
                            isRepeat: true,
                            isRefresh: true
                        }
                    })
                }
            })
        }
    },

    //	显示遥控器
    goConsole() {
        util.navigation('/pages/console/console');
    },

    //  操作歌曲
    operatingSong(ev) {
        const token = wx.getStorageSync('token');
        this.setData({
            isClicked: true
        });
        util.httpRequest(ev.detail.url, ev.detail.tempParam, 'POST', token, data => {
            util.operatingSongCBInfo(data.status_code == '200' ? data.status_code : data).then(value => {
                this.setData({
                    isClicked: false
                });
                if (value == '200') {
                    if (ev.detail.type !== 'Recording' && ev.detail.type != 'Collect') this.processSelectedData(this.data.selectedData.head_selectedIdx)
                }
            })
        })
    },

    //  上拉加载更多
    onReachBottom() {
        if (this.data.totalPage > this.data.currentPage && this.data.totalPage >= 2 && this.data.isLoadingCompleted) {
            this.setData({
                isLoadingCompleted: false
            });
            // setTimeout(() => {
            this.data.currentPage += 1;
            this.getChoosedList()
            // }, times)
        }
    }
})