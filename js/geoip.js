function addCountry(data) {
    for (var i = 0; i < data.length; i++) {
        // console.log(data[i]);
        data[i]["country"] = getLocation(data[i].ip);
    }
    return data;
}
function getLocation(ip) {
    var area="Null";
    $.ajax({
        url: "http://47.75.245.66/api/ipredis.php?ip=" + ip,  //请求的URL
        timeout: 1000, //超时时间设置，单位毫秒
        type: 'get',  //请求方式，get或post
        async:false,
        data: {},  //请求所传参数，json格式
        dataType: 'json',//返回的数据格式
        success: function (data) { //请求成功的回调函数
            // alert("成功");
            // console.log(data);
            area= data[0]+"-"+data[1]+"-"+data[2];
        },
        error: function(jqXHR, textStatus, errorThrown) {
            /*错误信息处理*/
            // console.log(textStatus);
            // return "Null";
        },
        complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
            if (status == 'timeout') {//超时,status还有success,error等值的情况
                // console.log("timeout");
                // return "Null";
            }
        }
    });
    return area;
}