function addCountry(data) {
    for (var i = 0; i < data.length; i++) {
        // console.log(data[i]);
        data[i]["country"] = getLocation(data[i].ip);
    }
    return data;
}

var resultData;
function getFileFromWeb() {
    var url = "./data/ipip.ipdb";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
        if (this.status == 200) {
            var blob = this.response;
            if (window.FileReader) {
                var fr = new FileReader();
                // console.log(;
                fr.onloadend = function (e) {
                    var data = fr.result;
                    resultData = new Uint8Array(data)
                    console.log("load success");
                    // localStorage.setItem("dbfile", blob);
                };
                fr.readAsArrayBuffer(blob);
            } else {
                console.log("not support");
            }
        } else {
            console.log("error");
        }
    }
    xhr.send();
}
getFileFromWeb();
var city = null;
function getLocation(ip) {
    try {
        if (city == null) {
            city = new City(resultData);
        }
        var ipinfo = city.findInfo(ip, "CN");
        return ipinfo.countryName + "-" + ipinfo.regionName + "-" + ipinfo.cityName;
    } catch (error) {
        return "Null";
    }
}
//online request
// function getLocation(ip) {
//     var area="Null";
//     $.ajax({
//         url: "http://47.75.245.66/api/ipredis.php?ip=" + ip,  //请求的URL
//         timeout: 1000, //超时时间设置，单位毫秒
//         type: 'get',  //请求方式，get或post
//         async:false,
//         data: {},  //请求所传参数，json格式
//         dataType: 'json',//返回的数据格式
//         success: function (data) { //请求成功的回调函数
//             // alert("成功");
//             // console.log(data);
//             area= data[0]+"-"+data[1]+"-"+data[2];
//         },
//         error: function(jqXHR, textStatus, errorThrown) {
//             /*错误信息处理*/
//             // console.log(textStatus);
//             // return "Null";
//         },
//         complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
//             if (status == 'timeout') {//超时,status还有success,error等值的情况
//                 // console.log("timeout");
//                 // return "Null";
//             }
//         }
//     });
//     return area;
// }