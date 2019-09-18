const util = require("../../utils/util.js");
const app = getApp();
Page({
  data: {
    menuTapCurrent: 0,
    menuCheerCurrent: 0,
    popitems: {}, //弹幕初始值
    count: 5, //弹幕按钮倒计时
    disabled: '', //弹幕按钮
    checked: false, //自动导唱
    currentInputData: {},//弹幕最终值
    // menuLight: 0,
    lightStyle: [
      {
        id: 0,
        style: "自动"
      },
      {
        id: 1,
        style: "明亮"
      },
      {
        id: 2,
        style: "动感"
      },
      {
        id: 3,
        style: "抒情"
      },
      {
        id: 4,
        style: "柔和"
      },
      {
        id: 5,
        style: "关闭"
      }
    ],
    sounds: [
      {
        id: 1,
        sound: "流行"
      },
      {
        id: 2,
        sound: "慢歌"
      },
      {
        id: 3,
        sound: "乡村"
      },
      {
        id: 4,
        sound: "爵士"
      },
      {
        id: 5,
        sound: "METAL"
      },
      {
        id: 6,
        sound: "摇滚"
      },
      {
        id: 7,
        sound: "录音棚"
      },
      {
        id: 8,
        sound: "磁性"
      },
      {
        id: 9,
        sound: "空灵"
      },
      {
        id: 10,
        sound: "老唱片"
      },
      {
        id: 11,
        sound: "电音"
      },
      {
        id: 12,
        sound: "和声"
      },
    ],
    styles: 0,
    poww: 0,
    token: "",
    cheer: [], //喝彩
    audio: 0, // 音效
  },
  onLoad: function() {
    var that = this;
    var token = wx.getStorageSync("token");
    that.setData({
      token: token
    });
 //请求表情数据
    //喝彩+倒彩
    util.httpRequest(
      "/manage/screen/findExpressionList",
      "{type:0,type:1}",
      "POST",
      that.data.token,
      function(data) {
        if(parseInt(data.status_code) == '200'){
          console.log('请求表情',data,that.data.token);
          that.setData({
            cheer: data.data.rows
          });
        } 
      }
    );
  },
  onShow: function() {
    var that = this;
    var token = wx.getStorageSync("token");
    that.setData({
      token: token
    });
    app.watch(that.deviceStatus, "consumerUpdateRoomDevicesStatus");
    app.watch(that.autosing,"consumerAdviceAutoSong");

    //请求弹幕数据
    util.httpRequest(
      "/manage/screen/findBarrageList",
      "",
      "POST",
      that.data.token,
      function(data) {
        if(parseInt(data.status_code) == '200'){
          that.setData({
            popitems: data.data.rows,
            currentInputData: {
              id: that.data.popitems.id,
              message: that.data.popitems.name
            }
            
          });
        }
      }
    );
  },
/**
 * 
 * @description:  同步TV端自动导唱开关状态
 */
 autosing: function(data) {
  //  console.log(data,'WS自动导唱同步TV端状态');
   if(data == 'close') {
     this.setData({
      checked: false
     })
   } else {
     this.setData({
       checked: true
     })
   }
 },

/**
 * @description: 同步TV端评分状态
 */

  deviceStatus: function(data) {
  // console.log(data,'pppPPAP');
  if(data == 'close') {
    this.setData({
      poww: 0
    })
  } else {
    this.setData({
      poww: 1
    })
  }
  },
  //向TV发送表情包
  cheerTV(e) {
    var cid = e.currentTarget.dataset.cheers;
    util.httpRequest(
      "/manage/screen/sendScreenExpression",
      { screenExpressionId: cid },
      "POST",
      this.data.token,
      function(data) {
        console.log('表情包',data);
      }
    );
  },

  //弹幕选项卡
  toggle(e) {

    this.setData({
      currentInputData: {
        id: e.currentTarget.dataset.id,
        message: e.currentTarget.dataset.message
      }
    });
  },

  //获取输入框的值
  getpop(e) {
    this.setData({
      currentInputData: {
        message: e.detail.value
      }
    });
  },


  //向TV发送弹幕
  sendpopTV() {
    var that = this;
   
      var inputcontent = this.data.currentInputData.message;
      util.httpRequest(
        "/manage/screen/sendScreenBarrage",
        { name: inputcontent },
        "POST",
        this.data.token,
        function(data) {
          console.log('弹幕',data);
          if(data.status_code == 200) {
            that.setData({
              currentInputData: '',
              disabled: true
            })
          }
        }
      );
    
    
    //发送按钮倒计时
   var i = that.data.count;
   var acount = setInterval(()=>{
      i--;
      that.setData({
      count: i
    })
    if(that.data.count == 0){
      clearInterval(acount);
      that.setData({
       disabled: false,
       count: 5
      })
     } 
    },1000);
    
    
    
    
  },
  
  //向TV端发送灯光
  lightup(e) {
    var light = e.currentTarget.dataset.light;
    util.httpRequest("/manage/screen/adjustLighting",{type:light},"POST",this.data.token,function(data){
      console.log('灯光',data);
    })
  },

  //大的选项卡
  menutap: function(e) {
    var current = e.currentTarget.dataset.current; //获取到绑定的数据
    //改变menuTapCurrent的值为当前选中的menu所绑定的数据
    this.setData({
      menuTapCurrent: current
    });
  },
  //自动导唱
  autoSing(e) {
    let action = e.detail.value;
    var actions = action? "open" : "close";
    console.log(actions);
    util.httpRequest("/manage/screen/adviceAutoSongs",{action: actions},"POST",this.data.token,function(data){
      console.log('自动导唱',data);
    }) 
  },

  //音效选项卡
  soundstyle: function(e) {
    var sound = e.currentTarget.dataset.sound;
    this.setData({
      audio : sound
    })
    console.log(this.data.audio,'音效');
     util.httpRequest("/manage/screen/adjustTone",{type:sound},"POST",this.data.token,function(data){
       console.log('音调',data);
     })

  },
  

  //混响
  onLive(e) {
    var live = e.currentTarget.dataset.live;
    var condition = "";
    if(live == 1){
      condition = "add";
    }else {
      condition = "reduce";
    }
     util.httpRequest("/manage/screen/resizeReverberation",{action:condition},"POST",this.data.token,function(data){
       console.log('混响',data);
     })
  },

  //评分选项卡
  power(e) {
    var powers = e.currentTarget.dataset.pid;
    var grade = "";
    this.setData({
      poww: powers
    })
    if(powers == 1){
      grade = "open";
    }else {
      grade = "close";
    }
    util.httpRequest("/manage/room/updateRoomDevicesStatus",{status:grade},"POST",this.data.token,function(data){
      console.log('评分',data);
    })
  },
  

  
  // 滑块
  onDrag(event) {
    this.$setData(currentValue, event.detail.value);
  }
});
