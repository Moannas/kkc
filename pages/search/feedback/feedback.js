const util = require("../../../utils/util.js");
Page({
  data: {
    feeds: 0,
    suggs: 1,
    song: "",
    singer: "",
    phone: "",
    leaveword: "",
    isSubmit: true,
    token: "",
    issubmitsugg: true,
    suggcontent: "",
    img: [],
    imgArray:[]
  },
  /*
      @Description: 页面初始化获取openid/token
     */
  onLoad: function () {
    //  从缓存中获取uid/openid/token
    var token = wx.getStorageSync("token");
    var openid = wx.getStorageSync("openid");
    this.setData({
      openid: openid,
      token: token
    });
  },
  //输入内容不为空时按钮激活
  getValue: function (event) {
    var type = event.currentTarget.dataset.type;
    var value = event.detail.value;
    switch (type) {
      case "0":
        this.data.song = value;
        break;
      case "1":
        this.data.singer = value;
        break;
      case "2":
        this.data.phone = value;
        break;
      case "3":
        this.data.leaveword = value;
        break;
      default:
        break;
    }
    if (
      this.data.song &&
      this.data.singer &&
      this.data.phone &&
      this.data.leaveword
    ) {
      this.setData({
        isSubmit: false
      });
    } else {
      this.data.isSubmit = true;
    }
    this.setData({
      song: this.data.song,
      singer: this.data.singer,
      phone: this.data.phone,
      leaveword: this.data.leaveword
    });
  },
  feedBack: function (e) {
    var fback = e.currentTarget.dataset.feed;
    this.setData({
      feeds: fback
    });
  },

  submitInfo() {
    //歌曲反馈输入框的内容提交到后台
    var that = this;
    var temp = {
      singerName: that.data.singer,
      songName: that.data.song,
      phone: that.data.phone,
      content: that.data.leaveword,
      type: "0"
    };
    util.httpRequest(
      "/manage/consumerFeedback/saveConsumerFeedbacks",
      temp,
      "POST",
      this.data.token,
      function (data) {
        if (data.status_code == "200") {
          that.setData({
            song: "",
            singer: "",
            phone: "",
            leaveword: ""
          });
          //跳到提交成功页面
          wx.navigateTo({
            url: "/pages/search/submitted/submitted"
          });
        } else {
          console.log("抱歉提交失败啦~");
        }
      }
    );
  },

  suggToggle: function (e) {
    var fbacks = e.currentTarget.dataset.sugg;
    this.setData({
      suggs: fbacks
    });
  },
  getsuggest: function (e) {
    // console.log(this.data.img);
    var value = e.detail.value;
    this.data.suggcontent = value;
    if (this.data.suggcontent) {
      this.setData({
        issubmitsugg: false
      });
      // console.log(this.data.issubmitsugg);
    } else {
      this.data.issubmitsugg = true;
    }
  },

  //调起微信选择图片
  chooseimg: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: function (res) {
        // tempFilePath可以作为img标签的src属性显示图片

        if (that.data.img.length < 3) {
          that.data.img.push(res.tempFilePaths);
          that.setData({
            img: that.data.img
          });
        } else {
          wx.showToast({
            title: "上传图片已达上限",
            icon: "none",
            duration: 2000
          });
        }
      }
    });
  },
  //删除图片
  deleteimg: function (e) {
    var ddx = e.currentTarget.dataset.id;
    this.data.img.splice(ddx, 1);
    // console.log(this.data.img);
    this.setData({
      img: this.data.img
    });
  },
  submitForm:function(){
    var that =this;
    var temps = {
      content: that.data.suggcontent,
      type: that.data.suggs,
      image: that.data.imgArray
    };
    //上传到本地
    util.httpRequest(
      "/manage/consumerFeedback/saveConsumerFeedbacks",
      temps,
      "POST",
      this.data.token,
      function (data) {
        if (data.status_code == "200") {
          // console.log(data.status_code)
          that.setData({
            suggcontent: "",
            suggs: 1,
            img: ""
          });
          //跳到提交成功页面
          wx.navigateTo({
            url: "/pages/search/submitted/submitted"
          });
        } else {
          console.log("抱歉提交失败啦~");
        }
      }
    );
  },
  //提交建议到后台
  submitsuggest() {
    var that = this;
    var token = wx.getStorageSync("token");
    var imgs = that.data.img.toString();
    var imgarr = that.data.img;
    //上传到服务器
    for (var i = 0; i < imgarr.length; i++) {
      var index =i;
      wx.uploadFile({
        url: "https://ktv.91kcapp.com/client/uploadFile",
        filePath: imgarr[i].toString(),
        name: "file",
        header: {
          "content-type": "application/x-www-form-urlencoded",
          Authorization: token
        },
        success(res) {
          console.log(res.data);
          let resData = JSON.parse(res.data);
          console.log(res.data);
          var imgArray = that.data.imgArray;
          imgArray.push(resData.data.filename);
          that.setData({
            imgArray: imgArray
          });
          console.log("index:"+index+"imgLenth:"+imgarr.length);
          if (index == imgarr.length) {
            that.submitForm();
          }
          index++;
        },
        fail(res) {
          console.log(res.data);
        }
      });
    }
  }
});
