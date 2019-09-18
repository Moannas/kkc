/*
 * @Author: zhoudagua 
 * @Date: 2018-05-11 17:42:26 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-09-17 17:13:58
 * @Description: 请添加描述 
 */
const app = getApp();
const util = require('../../utils/util.js');
const callingTime = 3000;
var token = wx.getStorageSync('token');
Page({
    data: {
        optionsData: [{
                id: 0,
                class: 'icon-original',
                hoverClass: 'icon-original-active',
                title: '原唱/伴唱'
            },
            {
                id: 1,
                class: 'icon-play op-item-15',
                hoverClass: 'icon-play-active',
                title: '播放/暂停'
            },
            {
                id: 2,
                class: 'icon-reset op-item-15',
                hoverClass: 'icon-reset-active',
                title: '重唱'
            },
            {
                id: 3,
                class: 'icon-next',
                hoverClass: 'icon-next-active',
                title: '切歌'
            }
        ],
        volumeData: [{
                id: 0,
                upClass: 'icon-vol-up',
                downClass: 'icon-vol-down',
                upHoverClass: 'icon-vol-up-active',
                downHoverClass: 'icon-vol-down-active',
                title: '音量'
            },
            {
                id: 1,
                upClass: 'icon-mic-up',
                downClass: 'icon-mic-down',
                upHoverClass: 'icon-mic-up-active',
                downHoverClass: 'icon-mic-down-active',
                title: '麦克风'
            },
            {
                id: 2,
                upClass: 'icon-lift-up',
                downClass: 'icon-lift-down',
                upHoverClass: 'icon-lift-up-active',
                downHoverClass: 'icon-lift-down-active',
                title: '升降调'
            }
        ]
    },

    //  播放功能台
    optionsTap: function (ev) {
        var token = wx.getStorageSync('token');
        const id = ev.currentTarget.dataset.id;
        const url = [];
        //  0：原唱/伴唱
        //  1：播放/暂停    
        //  2：重唱
        //  3：切歌
        switch (id) {
            case 0:
                url.push('/console/originalAccompany');
                break;
            case 1:
                url.push('/console/playStop');
                break;
            case 2:
                url.push('/console/replaySong');
                break;
            case 3:
                url.push('/console/nextSong');
                break;
        }
        util.httpRequest(url.join(''), {}, 'POST', token, data => {
            console.log(data)
        })
    },

    //  音量控制台
    volumeTap: function (ev) {
        var token = wx.getStorageSync('token');
        const id = ev.currentTarget.dataset.id;
        const type = ev.currentTarget.dataset.type === "up" ? "up" : "down";
        const url = [];
        console.log(ev.currentTarget.dataset.id,'哪个是麦克风');
        switch (id) {
            case 0:
                url.push('/console/volume');
                break;
            case 1:
                url.push('/manage/screen/adjustMic');
                break;
            case 2:
                url.push('/console/tune');
                break;
        }
        util.httpRequest(url.join(''), {
            action: type
        }, 'POST', token, data => {
            console.log(data)
        })
    },

    /**
     * @Description: 关闭控制台
     */
    closeConsole: function () {
        const animation = wx.createAnimation({
            duration: 100,
            timingFunction: 'linear'
        });
        animation.rotate(90).step();
        this.setData({
            animationData: animation.export()
        });
        setTimeout(function () {
            wx.navigateBack({
                delta: 1
            })
        }, 150)
    },

    //  呼叫服务
    callingService() {
        var token = wx.getStorageSync('token');
        util.httpRequest('/client/callHelp', {}, 'POST', token, data => {
            util.operatingSongCBInfo(data.status_code == '200' ? data.status_code : data)
        })
    }
})