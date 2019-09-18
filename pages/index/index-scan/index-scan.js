/*
 * @Author: Zhoudagua
 * @Email: 495144492@qq.com
 * @Date: 2019-08-21 11:28:35
 * @LastEditors: Zhoudagua
 * @LastEditTime: 2019-08-22 11:15:07
 * @Description: 
 */
const app = getApp();
const util = require('../../../utils/util');
Page({
  data: {
    isConnect: false,
    openid: '',
    isClicked: false,
  },
  onShow() {
    var openid = wx.getStorageSync('openid');
    util.updateToken(openid, {
    })
  },
  goscan() {
    var that = this;
    wx.scanCode({
      success(res) {
        //解析房间码
        var a = res.path.split("?")[1];
        var code = a.split("=")[1];
        // 保存房间连接码
        wx.setStorage({
          key:"code",
          data:code
        })
        util.connRoom(code, that, data =>{
          //返回上一页
          if(data){
            wx.navigateBack({
              delta: 1
            })
          }
        })

      }
    })


  }


})