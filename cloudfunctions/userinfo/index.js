

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
    const wxContext = cloud.getWXContext();
    if(event.reset){
        var res= await db.collection('db_qa_result').where({
            openId:wxContext.OPENID,
            status:1
        }).update({
            data:{
                status:0
            }
        });
        return res;
    }
    if(event.type == 'all'){
        if(event.value){
            var res= await db.collection('db_qa_result').where(_.or([
                {
                    userclass: db.RegExp({
                        regexp: event.value,
                        options: 'i',
                      }),
                      status:1
                      
                },{
                    username: db.RegExp({
                        regexp: event.value,
                        options: 'i',
                      }),
                      status:1
                }
            ])).get();
        }else{
            var res= await db.collection('db_qa_result').where({
                status:1
            }).get();
        }
        var result = []
        res.data.forEach(obj=>{
            if(result.length==0){
                var data = {
                    openId:obj.openId,
                    time:obj.create_time,
                    userclass:obj.userclass,
                    username:obj.username,
                }
                data.text1 = obj.text
                data.qa1 = obj.qa
                result.push(data)
            }else{
                var index=-1
                // for(let j=0;j<result.length-1;j++){
                //     if(obj.openId == result.length[j].openId){
                //         index = j
                //     }
                // }
                var data = {
                    openId:obj.openId,
                    time:obj.create_time,
                    userclass:obj.userclass,
                    username:obj.username,
                }
                var r_index=-1;
                result.forEach((item,i)=>{
                    
                    if(obj.openId == item.openId){
                        r_index = i;
                        // result[i].text2 = obj.text
                        // result[i].qa12 = obj.qa
                    }else{
                        // data.text1 = obj.text
                        // data.qa1 = obj.qa
                        // data.usermobile = obj.usermobile
                        // data.address = obj.address
                        // result.push(data)
                    }
                })
                if(r_index==-1){
                    data.text1 = obj.text
                    data.qa1 = obj.qa
                    data.usermobile = obj.usermobile
                    data.address = obj.address
                    result.push(data)
                }else{
                    result[r_index].text2 = obj.text
                    result[r_index].qa12 = obj.qa
                }
                // var data = {
                //     openId:obj.openId,
                //     time:obj.create_time,
                //     userclass:obj.userclass,
                //     username:obj.username,
                // }
                // if(index!=-1){
                //     result[index].text2 = obj.text
                //     result[index].qa12 = obj.qa
                // }else{
                //     data.text1 = obj.text
                //     data.qa1 = obj.qa
                //     data.usermobile = obj.usermobile
                //     data.address = obj.address
                //     result.push(data)
                // }
            }
            
        })
        return result;
    }
    if(event.type == 'detail'){
        var res= await db.collection('db_qa_result').where({
            openId:event.openId||wxContext.OPENID,
            status:1
        }).get()
        return res.data;
    }
    if(event.type =='result'){
        var data_info = event;
        data_info.openId = wxContext.OPENID;
        data_info.appId = wxContext.APPID;
        data_info.env = wxContext.ENV;
        data_info.create_time = db.serverDate();
        data_info.updata_time = db.serverDate();
        data_info.status = 1
        
        var res = await db.collection('db_qa_result').add({
            // data 字段表示需新增的 JSON 数据
            data: data_info
        })
        if(Number(data_info.show) == 2){
            await db.collection('db_userinfo').where({
                openId: wxContext.OPENID
            }).update({
                data:{
                    result_qa:0
                }
            })
        }
        return res;
    }

    if(event.type =='qa'){
        var res1= await db.collection('db_qa').where({
            status:'1',
            show:'1'
        }).get()
        var res2= await db.collection('db_qa').where({
            status:'1',
            show:'2'
        }).get()
        return {
            qa1:res1.data,
            qa2:res2.data
        };

    }
    if (event.type == 'sf'){
        event.updata_time = db.serverDate();
        var t= await db.collection('db_teacher').where({
            mobile: event.code_mobile,
            status:1
        }).get()
        if(t.data.length){
            event.teacher = t.data[0];
            event.student = 0;
        }else{
            event.student = 1;
        }
        var res = await db.collection('db_userinfo').where({
            openId: wxContext.OPENID
        }).update({
            data:event
        })
        var data =  res;
        return data;
    }
    if (event.type){
        event.updata_time = db.serverDate();
        var t= await db.collection('db_teacher').where({
            mobile: event.code_mobile,
            status:1
        }).get()
        if(t.data.length){
            event.teacher = t.data[0];
        }else{
            event.student = 1;
        }
        var res = await db.collection('db_userinfo').where({
            openId: wxContext.OPENID
        }).update({
            data:event
        })
        res.stats.student= event.student||'';
        var data =  res;
        return data;
    }
    var res= await db.collection('db_userinfo').where({
        openId: wxContext.OPENID
    }).get()
    if (res.data[0]) {

        var resultRes= await db.collection('db_qa_result').where({
            openId: wxContext.OPENID,
            status: 1
        }).get()
        var t = await db.collection('db_teacher').where({
            mobile: res.data[0].code_mobile,
            status: 1
        }).get()

        var data = res.data[0];
        data.qa=resultRes.data||[]
        data.t=t.data[0]||{}
        return data;
    }else{
        var data_info = {};
        data_info.openId = wxContext.OPENID;
        data_info.appId = wxContext.APPID;
        data_info.env = wxContext.ENV;
        data_info.create_time = db.serverDate();
        data_info.updata_time = db.serverDate();
        var res = await db.collection('db_userinfo').add({
            // data 字段表示需新增的 JSON 数据
            data: data_info
        })
        
        var data = res.data || "";
        return data;
    }
}