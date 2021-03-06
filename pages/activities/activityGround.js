const app = getApp()
let util = require('../../utils/util_wenda');
let config = require('../../config');

const login = require('../../utils/login.js')
let activities
let code
const notice = require('../../vendors/WxNotificationCenter')
const location = require('../../utils/getLocation')
const {
  ActivityGround,
  ActBanner,
  BannerList,
  ActivityList
} = require('../../utils/Class')

let self = {}
let myCard = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // activities:data.activities,
    activities: [],

    page: 1,
    name: '',
    imgUrls: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    self = this
    activities = [];

    code = null

    location.getLocation(selectedCityInfo => {
      app.globalData.selectedCityInfo = selectedCityInfo
      notice.postNotificationName('Addcity', selectedCityInfo)
      // if (!app.globalData.selectedCityInfo.cityCode) {
      //   code ='110000'
      // } else {
      code = app.globalData.selectedCityInfo.cityCode
      // }
      // this.getActivities(code);
    }, () => {
      code = '110000'
      // this.getActivities(code)
    })
    // notice.addNotification('city', that.changeCities, that)
    // notice.addNotification('getCity', that.getNewCities, that)
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo,
      })
    }

    myCard = wx.getStorageSync('card')
    // this.getActivities()
    self.getBanner()
    self.getActiveInfo()
  },
  //获取HR活动社区
  getActiveInfo() {

    let {
      page,
      name
    } = self.data

    const parms = {
      page,
      name,
      showLoading: true,

    }

    util.request({
      url: config.hrlooUrl + ActivityList,
      data: parms,
      autoHideLoading: false,

      method: "POST",
      withSessionKey: true
    }, self.getActiveInfo).then(res => {

      if (res.result == 0) {
        let {
          data,
          count,
          pages
        } = res.data

        if (pages == 1 || pages == page) {
          self.setData({
            loadAll: true
          })
        }

        //第一页
        if (page == 1) {
          self.setData({
            activities: data
          })
        } else {
          //分页
          self.setData({
            activities: [...self.data.activities, ...data]
          })
        }
      }
    })
  },
  //更新登录过期
  updataApi() {
    const that = this
    console.log("更新登录页")
    wx.login({
      success: res => {
        login.login(res.code).then(res => {
          that.getActiveInfo()
          that.getBanner()
        })

      }
    })
  },
  // getActivities() {
  //   ActivityGround.find().then(res => {
  //     console.log(res.list)
  //     // var result = [];
  //     // var arr = res.list;
  //     // var count = arr.length;
  //     // for (var i = 0; i < 10; i++) {
  //     //   var index = ~~(Math.random() * count) + i;
  //     //   result[i] = arr[index];
  //     //   arr[index] = arr[i];
  //     //   count--;
  //     // }
  //     if (res && res.result === 0) {
  //       let {data} = res.data
  //       this.setData({
  //         activities: data
  //       })
  //     }

  //   })

  //   // let page = 1
  //   // ActivityGround.find().then(res => {
  //   //   console.log(res)
  //   //   // this.data.activities = []
  //   //     this.setData({
  //   //     activities:res.list
  //   //   })
  //   // })      
  // },
  // getBanner() {

  //   BannerList.find({
  //     showLoading: true,
  //   }).then(res => {
  //     console.log(res)
  //     this.setData({
  //       imgUrls: res.data
  //     })
  //   })

  // },
//获取首页轮播
  getBanner() {

    util.request({
      url: config.hrlooUrl + BannerList,
      autoHideLoading: false,

      method: "POST",
      withSessionKey: true
    }, self.getBanner).then(res => {

      if (res.result == 0) {
        this.setData({
          imgUrls: res.data
        })
      }

    })

    // BannerList.create().then(res => {
    //   if(res&&res.result==0){
    //   this.setData({
    //     imgUrls: res.data
    //   })
    //   } 
      // else if (res.result == 999 ) {
      //   let userinfo = wx.getStorageSync('userInfo')
      //   self.getInfo(userinfo)
      // }else if(res.result==100){
      //   self.setData({
      //     isLogin:false,
      //     handleError: true
      //   })
      // }

    // })

  },
  gotoWeb(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.image.BanUrl
    })

  },
  getInfo(e) {
    // console.log(e)
    let userinfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userinfo
    })
    // wx.setStorageSync('userInfo', e.detail.userInfo)
    // app.globalData.userInfo = e.detail.userInfo
    wx.login({
      success: res => {
        login.login(res.code, userinfo).then(res => {
          // debug.log(res)
        })
      }
    })
  },

  gotoPage(e) {
    const path = e.currentTarget.dataset.path
    let card = wx.getStorageSync('card')
    if (path === 'create') {
      if (!card) {
        wx.showModal({
          title: '提示',
          content: '您还没有名片，是否立即前往',
          success: res => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/cards/makeCard',
              })
            }
          }
        })
        return
      }
    }
    wx.navigateTo({
      url: path
    })
  },

  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: function () {
  //   this.getActivities()
  //   this.getBanner()
  //   wx.hideNavigationBarLoading()
  //   wx.stopPullDownRefresh()
  // },
  // //下拉刷新
  // onPullDownRefresh: function() {
  //   self.setData({
  //     page: 1,
  //     loadAll: false
  //   })
  //   self.getCards().then(res => {
  //     wx.hideNavigationBarLoading()
  //     wx.stopPullDownRefresh()
  //   })
  // },
  // //上拉加载更多
  // onReachBottom: function() {
  //   let {
  //     page,
  //     loadAll
  //   } = self.data
  //   if (!loadAll) {
  //     self.setData({
  //       page: ++page
  //     })
  //     self.getCards()
  //   }
  // },


  //下拉刷新
  onPullDownRefresh: function() {
    self.setData({
      page: 1,
      loadAll: false
    })
    self.getActiveInfo()
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
  },
  //上拉加载更多
  onReachBottom: function() {
    let {
      page,
      loadAll
    } = self.data
    if (!loadAll) {
      self.setData({
        page: ++page
      })
      self.getActiveInfo()
    }
  }

  /**
   * 用户点击右上角分享
   */

})