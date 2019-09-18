Page({
    data: {
       
    },

  ensure() {
      //点击确定后回到搜索页
      wx.redirectTo({
        url: '/pages/search/feedback/feedback',
    })
  }
    
    
})