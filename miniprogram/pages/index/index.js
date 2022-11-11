const app=getApp()
const db = wx.cloud.database()
Page({
  //页面的初始数据
  data: {
    ss_xx:[],
    _ss_xx:[],
    lunbotu:[],
    yincang:true,
    shuaxin:"",
    search:"",
    zuixinorzuire:0,
    movehight:500,
    movehight2:500,
    message:[],
    index:-1,
    yizhou:"",
    kong:false,
    jiazaizhong:false,
    gonggao:{
      title:"版本更新"
    }
  },
  //生命周期函数--监听页面加载
  onLoad: function (options) {
    var tjid=options.id
    var fenxiang=options.fenxiang
    var liuyan=options.liuyan
    let logined=app.userInfo.userinfo.login;
    //console.log(app.userInfo);
    this.guanggao()
    app.fenxiang="false"
    var systeminfo=wx.getSystemInfoSync()
    //console.log(systeminfo.windowHeight)
    this.setData({
      movehight:systeminfo.windowHeight,
      movehight2:systeminfo.windowHeight-80
    })
    if(logined!=true){
      /*调用云函数登录*/ 
      wx.showLoading({
        title: '检查登录',
        mask:true
      })
      wx.cloud.callFunction({
        name:'login',
        data:{}
      }).then((res)=>{
        //console.log("获取到openid:",res.result.openid);
        db.collection("users").where({
          _openid:res.result.openid
        }).get().then((res)=>{
          //console.log("首页登录取到的对应openid的信息：",res.data[0]);
          app.userInfo=Object.assign(app.userInfo,res.data[0]);
          this.jiazai()
          wx.hideLoading()
          if(app.userInfo._openid==""){
            /*如果没有登录信息则跳转到wd*/ 
            //如果没有登录信息则提示未登录
            wx.showToast({
              title: '未登录只可浏览',
              icon:'none',
              duration:3000
            })
          }else{
            //登录上了就监听user
            if(!app.jianting){
              //开启监听
              this.jianting()
              app.jianting=true
              this.logintime()//更新上这次登陆时间
            }
          }
        })
      });
    }else{
      this.jiazai()
      //登录上了就监听user
      if(!app.jianting){
        //开启监听
        this.jianting()
        app.jianting=true
      }
    }
    if(tjid!="" && tjid!=undefined && tjid!=null){
      wx.navigateTo({
        url:"../plate2/plate2?id="+tjid+"&fenxiang="+fenxiang+"&liuyan="+liuyan
      })
    }
  },
  // 获取滚动条当前位置
  onPageScroll: function (e) {
    //console.log(e)
    if (e.scrollTop > 200) {
      this.setData({
        yincang: false
      });
    } else {
      this.setData({
        yincang: true
      });
    }
  },
  //获取广告轮播图地址(管理openid)并赋值到data
  guanggao(){
    console.log(app.system1)
    if(app.system1==""||app.system1==undefined){
      //获取写入
      db.collection('system').where({'_id':'system01'})
      .get().then((res)=>{
        //console.log(res)
        app.system1=res.data[0]
        this.setData({
          lunbotu:res.data[0].system.lunbotu,
          glids:res.data[0].system.glids
        })
        app.glids=res.data[0].system.glids
      })
    }else{
      this.setData({
        lunbotu:app.system1.system.lunbotu,
        glids:app.system1.system.glids
      })
      app.glids=app.system1.system.glids
    }
  },
  guanlifengtiezi(e){
    console.log(e.currentTarget.dataset)
    if(app.userInfo.userinfo.login!=true){
      return
    }
    var ban=app.userInfo.ban
    if(ban==true){
      wx.showToast({
        title: '账号被封！',
        icon:'none',
        duration:7000
      })
      return
    }
    var mine=false
    var myid=app.userInfo._id
    for(var ii=0; ii<app.glids.length;ii++){
      if(app.glids[ii]==myid){
        mine=true
        break
      }
    }
    if(mine==true){
      wx.setClipboardData({
        data: e.currentTarget.dataset.ids,
        success (res) {
          console.log("复制成功")
        }
      })
      var that=this
     
}
    
  },
  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  //刷新
  shuaxin(){
    this.setData({
      shuaxin:"",
      search:"",
      kong:false,
      ss_xx:[]
    })
    var shuaxin=true
    this.jiazai(shuaxin)
  },
  //生命周期函数--监听页面初次渲染完成
  onReady: function () {
    //写出一周前的时间戳
    var now=new Date().getTime()//现在的时间
    var yizhou=(now-3600*7000*24)
    console.log("现在：",now)
    console.log("一周：",yizhou)
    this.setData({
      yizhou:yizhou
    })
  },
  //生命周期函数--监听页面显示
  onShow: function () {
    this.checkred()
    //这是发帖成功，跳转刷新
    var shuaxin=app.shuaxin
    if(shuaxin){
      this.shuaxin()
      app.shuaxin=false
    }
    //这是检测是否登录,开启监听
    if(app.userInfo._id!=""){
      //登录状态
      if(!app.jianting){
        //开启监听
        this.jianting()
        app.jianting=true
      }
    }

    //点赞页面返回更新点赞评论浏览状态
    var index=this.data.index
    var ss_xx=this.data.ss_xx
    //console.log("index::::",index)
    if(index>=0){
      ss_xx[index].ss_xx.look=app.ssinfo.looknb
      var loveinfo=app.loveinfo
      //console.log("app.loveinfo:",loveinfo)
      if(loveinfo=='true'){
        console.log("返回点赞：",index)
        ss_xx[index].love=true
        app.loveinfo=""
      }else if(loveinfo=='false'){
        console.log("返回取消点赞：",index)
        ss_xx[index].love=false
        app.loveinfo=""
      }
      ss_xx[index].ss_xx.huifunb=app.ssinfo.plnb
      ss_xx[index].ss_xx.dianzannb=app.ssinfo.lovenb
      this.setData({
        ss_xx:ss_xx,
        index:-1
      })
    }
  },
  //刷新消息红点(用于更新非tabar页面未设置的红点)
  checkred(){
    var weidu=app.message.length
    if(weidu!=0){
      //有未读
      wx.setTabBarBadge({
        index: 3,
        text: weidu.toString()
      })
      app.hongdian=true
    }else{
      if(app.hongdian){//真的有内容时才移除
        wx.removeTabBarBadge({index: 3})
      }
      
    }
  },

  //生命周期函数--监听页面隐藏
  onHide: function () {},

  //生命周期函数--监听页面卸载
  onUnload: function () {},

  //用户点击右上角分享
  onShareAppMessage: function () {
    return{
      title:"茄茄私语"
    }
  },

  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    if(this.data.jiazaizhong==false){
      this.setData({
        jiazaizhong:true
      })
      this.jiazai()
    }
  },
  //跳转传参，传递板块名
  tiaozhuan(bankuai){
    //console.log(bankuai.currentTarget.dataset.ku)
    var bankuai=bankuai.currentTarget.dataset.bankuai
    wx.navigateTo({
      url:"../plate1/plate1?bankuai="+bankuai
    })
  },
  //加载数据(刷新状态下，data内ss_xx数组重新赋值)
  jiazai(shuaxin){
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    var zuixinorzuire=this.data.zuixinorzuire
    //console.log(shuaxin)
    var shuaxin2=this.data.shuaxin
    shuaxin=shuaxin2==""?shuaxin:shuaxin2
    //console.log(shuaxin2)
    if(shuaxin==true){
      var head=0
      console.log("toushi0")
    }else{
      var head=this.data.ss_xx.length
      console.log("toushih",head)
    }

if(zuixinorzuire==0){
  //按照时间排取消时间限制，
  zuixinorzuire="time"
  var yizhou=0
}else{
  //按照热度排行
  zuixinorzuire="ss_xx.dianzannb"
  var yizhou=this.data.yizhou
}


    //这下面是加载搜索值
    if(shuaxin2!=""){
      var text=this.data.shuaxin
      db.collection('ss').where({
        // name: _name,
        "ss_xx.nr":{
          $regex:'.*'+ text,
          $options: 'i'
        },
        'ss_xx.jubao.1':db.command.lte(9),
        time:db.command.gt(yizhou)

      }).orderBy(zuixinorzuire, 'desc').skip(head).get().then(async(res)=>{
        var ss_xx=this.data.ss_xx
        var xx=await this.love(res.data)
        ss_xx.push.apply(ss_xx,xx)
        this.setData({
          ss_xx:ss_xx,
          kong:true
        })
        //console.log("打印了")
        wx.hideLoading({})
        return
      })
      return
    }

    db.collection('ss').where({
        'ss_xx.jubao.1':db.command.lte(9),
        time:db.command.gt(yizhou)
    }).orderBy(zuixinorzuire, 'desc')
    .skip(head).get().then(async(res)=>{
      //console.log(res.data)//这里已经取到了相应的数组
      if(res.data==""){
        this.setData({
          kong:true,
          jiazaizhong:false
        })
        wx.stopPullDownRefresh({})
        wx.hideLoading({})
        wx.showToast({
          title: '没有更多了',
          icon: 'none',
          duration: 800
        })
        return
      }else if(shuaxin==true){
        //真刷新状态
        var ss_xx=await this.love(res.data)
      }else{
        //加载并加入
        var ss_xx=this.data.ss_xx
        var xx=await this.love(res.data)
        ss_xx.push.apply(ss_xx,xx)
      }
      //写进本地
      this.setData({
        ss_xx:ss_xx,
        kong:true,
        jiazaizhong:false
      })
      wx.hideLoading({})
      if(shuaxin==true){
        wx.stopPullDownRefresh({})
        wx.showToast({
          title: '刷新成功',
          icon: 'none',
          duration: 800
        })

      }else{
        //wx.hideLoading({})
      }
    })
  },
  xiangqing(e){
    var id=e.currentTarget.dataset.id
    var love=e.currentTarget.dataset.love
    var index=e.currentTarget.dataset.index
    console.log("index:",index)
    wx.cloud.callFunction({
      name:"look",
      data:{
        id:id,
        type:'ss'
      }
    })
    if(love){
      love='true'
    }else{
      love='false'
    }
    wx.navigateTo({
      url:"../plate2/plate2?id="+id+"&fenxiang=false&liuyan=false&love="+love
    })
    this.setData({
      index:index
    })
  },
   // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.tp[0];
    //所有图片
    var imgs = e.currentTarget.dataset.tp[1];
    
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },
  //搜索shijian
  search(e){
    //查询值
    //console.log(e.detail.value)
    var text=e.detail.value
    this.setData({
      shuaxin:e.detail.value
    })
    if(text==""){
      wx.showToast({
        title: '不能为空',
        icon:"none",
      })
      return
    }
    var zuixinorzuire=this.data.zuixinorzuire
    if(zuixinorzuire==0){
      zuixinorzuire="time"
      var yizhou=0
    }else{
      zuixinorzuire="ss_xx.dianzannb"
      var yizhou=this.data.yizhou
    }
    wx.showLoading({
      title: '搜索中',
      mask:true
    })
    //console.log("查询")//
    db.collection("ss").where({
        // name: _name,
        "ss_xx.nr":{
          $regex:'.*'+ text,
          $options: 'i'
        },
        time:db.command.gt(yizhou)
      }).get().then(async(res)=>{
        console.log(res.data)//这里一下取回了所有
        
        var xx=await this.love(res.data)
        this.setData({
          ss_xx:xx,
          kong:true
        })
        wx.hideLoading({})
        wx.showToast({
          title: '搜索完毕',
          icon:"none"
        })
      })
 
  },
  //处理点赞数据
async love(e){
  //console.log(e)
  var l=e.length
  for(var i=0;i<l;i++){
    var yn=e[i].ss_xx.dianzanid.indexOf(app.userInfo._id)
    //console.log(yn)
    if(yn==-1){
      e[i].love=false
    }else{
      e[i].love=true
    }
  }
  return e
},
  //返回组件Tabs的监听
  changetitle(e){
    console.log("title:",e.detail)
    var zuixinorzuire=this.data.zuixinorzuire
    if(e.detail!=zuixinorzuire){
      //暂存待机位
      var zhongjian=this.data._ss_xx
      //赋值待机位
      var _ss_xx=this.data.ss_xx
      var ss_xx=zhongjian
      this.setData({
        zuixinorzuire:e.detail,
        ss_xx:ss_xx,
        _ss_xx:_ss_xx,
      })
      console.log(ss_xx)
      if(ss_xx.length==0){
        this.setData({
          kong:false
        })
        console.log("数组空，加载")
        this.jiazai()
      }
    }
  },
  //下拉动作-刷新
  onPullDownRefresh: function () {
    this.shuaxin()
  },
  //点赞帖子(这里得加index)
  dianzan(e){
    var _id=app.userInfo._id
    var id=e.currentTarget.dataset.id
    var index=e.currentTarget.dataset.index

    console.log(e.currentTarget.dataset)
    if(app.userInfo.userinfo.login!=true){
      wx.showModal({
        title: '提示',
        content: '登录后才可进行此操作！是否进行授权登录？',
        showCancel:true,
        confirmText:'是',
        confirmColor:'#000000',
        cancelText:'否',
        cancelColor:'#FF4D49',
        success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.switchTab({url:"../mine/wd/wd"})
          return
        } else if (res.cancel) {
          console.log('用户点击取消')
        return
        }
        }
      })
      return
    }

    wx.cloud.callFunction({
      name:"dianzan",
      data:{
        id:id,
        dzrid:_id
      }
    })
    var ss_xx=this.data.ss_xx
    if(this.data.ss_xx[index].love){
      ss_xx[index].love=false
      ss_xx[index].ss_xx.dianzannb--
    }else{
      ss_xx[index].love=true
      ss_xx[index].ss_xx.dianzannb++
    }
    this.setData({
      ss_xx:ss_xx
    })
  },
  //消息监听
  jianting(){
    console.log("已经登录，开启监听user")
    var _id=app.userInfo._id
    var that=this
    this.watcher = db.collection('users').doc(_id).watch({
      onChange: function(e) {
        console.log('监听user数据变化：', e.docs[0])
        app.userInfo=e.docs[0]
        var message=e.docs[0].message//message数组
        app.message=message
        that.jiantingchuli(message)
      },
      onError: function(err) {
        console.error('监听出现问题！', err)
      }
    })
  },
  /*
  下面存放监听变化代码,进行红点更新
  */
  jiantingchuli(e){
    // 1.未读的数一直是数组成员数，0消息则移除红点
    var weidu=e.length//未读消息总数
    //console.log("监听处理1：")
    if(weidu!=0){
      //有未读，设置红点得看页面层级
      var ceng=getCurrentPages()
      if(ceng.length==1){
        //只有tabar页面才可以设置红点
        wx.setTabBarBadge({
          index: 3,
          text: weidu.toString()
        })
        app.hongdian=true
      }
      
      //console.log("监听处理3：有消息清空红点")
      //2.新的消息震动提醒
      var message=this.data.message//本地已收到message数组、每条新的消息都纪录进去
      //var newmessage=0
      for(var i=0;i<weidu;i++){
        var id=e[i].id
        var yn=JSON.stringify(message).includes(id)
        if(!yn){
          //说明是新的消息,给他震动提醒
          //newmessage++
          message.push(e[i])
          this.setData({
            message:message
          })
          //震动
          wx.vibrateLong({
            type:'heavy'
          })
          //console.log("监听处理3：新消息震动")
        }
      }   
    }else{
      //console.log("监听处理3：无消息清空红点")
      var ceng=getCurrentPages()
      if(ceng.length==1&&app.hongdian){
        //仅可在tabar页面设置红点
        wx.removeTabBarBadge({index: 3})
      }
    }
    
  },
  //图片预加载zhi 轮播图预加载
  imageOnLoad(e){
    var id = e.currentTarget.id;
    var result="lunbotu["+id+"]"+".loaded"
    this.setData({
      [result]: true
    })
  },
  //图片预加载zhi ss图预加载
  imageOnLoad2(e){
    //console.log("一次")
    var index0 = e.currentTarget.dataset.index0;
    var index1 = e.currentTarget.dataset.index1;
    //console.log("打印id",id)
    var xx='ss_xx['+index0+'].ss_xx.tp2['+index1+'].loaded'
    this.setData({
      [xx]:true
    })
  },
  //图片预加载失败
  imageOnLoadError(e){
    console.log("预加载失败：",e)
  },
  //上传此次登陆的时间
  logintime(){
    var now=new Date().getTime()
    console.log(app.userInfo._id)
    db.collection('users').doc(app.userInfo._id).update({
      data:{
        logintime:now
      }
    })
  },
  //跳到post页面
  add(){
    wx.navigateTo({
      url: '../post/post',
    })
  }
})