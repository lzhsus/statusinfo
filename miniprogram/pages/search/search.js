// pages/search/search.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command;
var timePromise = null;
import {debounce} from '../../utils/debounce'
 
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '',
        result:[]

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getResultAll()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },
    lookResult(e){
        const item = e.currentTarget.dataset.item;
        wx.navigateTo({
          url: '/pages/detail/detail?openId=' + item.openId
        })
    },
    onClickSearch(){
        console.log(this.data.searchValue)
        app.searchValue = this.data.searchValue
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var _this =this;
        wx.cloud.callFunction({
            name: 'userinfo',
            data: {
                type:'all',
                value:_this.data.searchValue
            }
        }).then(res => {
            wx.hideLoading()
            if (res.errMsg == "cloud.callFunction:ok") {
                console.log(res)
                res = res.result;
                res = res.map(obj=>{
                    obj.time = app.common.getNewTime('', new Date(obj.time));
                    return obj;
                })
                _this.setData({
                    result:res
                })
            } else {
                wx.showModal({
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
    },
    getResultAll(){
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var _this =this;
        wx.cloud.callFunction({
            name: 'userinfo',
            data: {
                type:'all'
            }
        }).then(res => {
            wx.hideLoading()
            if (res.errMsg == "cloud.callFunction:ok") {
                console.log(res)
                res = res.result;
                res = res.map(obj=>{
                    obj.time = app.common.getNewTime('', new Date(obj.time));
                    return obj;
                })
                _this.setData({
                    result:res
                })
            } else {
                wx.showModal({
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
    },
    change(e){
        console.log(e)
        this.setData({
            searchValue:e.detail
        })
    },
    search(e){
        console.log('search',e,this.searchValue)
    },
    cancel(e){
        console.log('cancel',e,this.searchValue)
    }
})