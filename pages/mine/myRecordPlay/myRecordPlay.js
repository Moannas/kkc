/*
 * @Author: lzh 
 * @Date: 2018-05-08 17:46:46 
 * @Last Modified by: lzh
 * @Last Modified time: 2019-03-07 14:42:51
 * @Description: 请添加描述 
 */

const myaudio = wx.createInnerAudioContext();
const util = require('../../../utils/util.js');
var timer;
Page({
  data: {
    isplay: false,//是否播放
    alltimer: 0,  //总时长
    nowvalue: 0,   //当前值
    iscollect: true,
    data: [],
    id: '',          //录音id
    isshow: false,    //判断是否从分享页面进入
  },
  onLoad: function (options) {
    console.log(options)
    const token = wx.getStorageSync('token');
    if (options.goin) {
      this.setData({ isshow: true })
    }                                                               //options.id
    util.httpRequest("/manage/soundRecording/playSoundRecording", { "id": options.id }, 'post', token, data => {
      console.log(data)
      this.setData({ data: data.data, alltimer: data.data.duration, id: options.id })
      myaudio.src = data.data.playUrl
    })
  },
  onUnload: function () {
    // 离开页面停止
    clearInterval(timer);
    myaudio.pause();
  },
  onHide: function () {
    // 离开页面停止
    clearInterval(timer);
    myaudio.pause();
  },

  //播放/停止
  play: function () {
    var that = this
    this.setData({ isplay: !this.data.isplay });
    if (this.data.isplay == false) {
      // 停止
      myaudio.pause();
      clearInterval(timer);
    } else {
      //播放
      myaudio.play();
      timer = setInterval(function () {
        that.data.nowvalue++;
        that.setData({ nowvalue: that.data.nowvalue });
        if (that.data.nowvalue >= that.data.alltimer) {
          that.setData({ isplay: false });
          clearInterval(timer);
          that.setData({ nowvalue: 0 });
        }
      }, 1000);
      this.islikeTimes(this.data.id, "play", "playArr") //更新播放次数
    }
  },
  // 点击进度条改变时
  change: function (e) {
    this.setData({ nowvalue: e.detail.value });
    var num = e.detail.value;
    myaudio.seek(num);
  },
  // 拖动进度条
  changing: function (e) {
    this.setData({ nowvalue: e.detail.value });
  },
  // 分享
  onShareAppMessage() {
    console.log(this.data.id)
    return {
      title: '录音分享',
      path: '/pages/mine/myRecordPlay/myRecordPlay?goin=1&id=' + this.data.id,
      success(res) {}
    }
  },
  like: function () {
    this.islikeTimes(this.data.id, "like", "likeArr") //更新喜欢次数
  },
  // 
  islikeTimes: function (id, like, likearr) {
    let arr = wx.getStorageSync(likearr);
    // 判断是否从分享页进入该页面
    if (this.data.isshow == true) {
      // 判断是否存有arr
      if (arr) {
        if (arr.indexOf(id) == -1) {
          util.httpRequest("/manage/soundRecording/soundRecordingOperation", { "id": id, "action": like }, 'post', '', data => {
            console.log(data)
            //重置喜欢次数与播放次数
            this.data.data.likeTimes = data.data.likeTimes;
            this.data.data.playedTimes = data.data.playedTimes;
            this.setData({ data: this.data.data });
            // 存储已经喜欢过与听过的歌曲
            arr.push(id)
            wx.setStorage({
              key: likearr,
              data: arr
            });
          })
        }
      } else {
        util.httpRequest("/manage/soundRecording/soundRecordingOperation", { "id": id, "action": like }, 'post', '', data => {
          this.data.data.likeTimes = data.data.likeTimes;
          this.data.data.playedTimes = data.data.playedTimes;
          this.setData({ data: this.data.data });
          wx.setStorage({
            key: likearr,
            data: [id]
          });
        })
      }

    }
  }
})