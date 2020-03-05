function setLocalStorage(blob) {
    if (window.FileReader) {
        var a = new FileReader();
        a.onload = function (e) { localStorage.setItem("ipip.ipdb", e.target.result); };
        a.readAsDataURL(blob);
    } else {
        console.log("not support FileReader");
    }
}
// dataURL转换为Blob对象
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(","), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

var LocadIPdb = self.setInterval("GetIPDB()", 5000);
var countInterval = 0;
var IPdbBlob;
var ajaxProcessing = false;
var GetIPDB = function () {//立即执行
    console.log(countInterval++);
    if (IPdbBlob == null) {//判断IpdbBlob 是否存在；
        var IPdbURL = localStorage.getItem("ipip.ipdb");
        if (IPdbURL == null) {//本地不存在，则向网络请求
            if (ajaxProcessing) { return; }
            var url = "./data/ipip.ipdb";
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "blob";
            xhr.onloadend = function () {
                if (this.status == 200) {
                    IPdbBlob = this.response;
                    window.clearInterval(LocadIPdb);//关闭定时器；
                    // localStorage.setItem("ipip.ipdb")
                    setLocalStorage(IPdbBlob);
                    iniGeo();
                    ajaxProcessing = false
                } else {
                    console.log("error");
                    ajaxProcessing = false;
                }
            };
            xhr.send();
            ajaxProcessing = true;
        } else {//本地存在，并取出IPdbBlob;闭定时器；
            IPdbBlob = dataURLtoBlob(IPdbURL);
            window.clearInterval(LocadIPdb);
            iniGeo();
        }
    } else {//存在IpdbBlob 则关闭定时器；
        window.clearInterval(LocadIPdb);
    }
}


function addCountry(data) {
    for (var i = 0; i < data.length; i++) {
        // console.log(data[i]);
        data[i]["country"] = getLocation(data[i].ip);
    }
    return data;
}

var city = null;
var IPdbArrayBuffer;
function iniGeo() {
    var a = new FileReader();
    a.onloadend = function (e) {
        IPdbArrayBuffer = e.target.result;
        console.log("IpdbArrayBuffer load success");
        city = new City(new Uint8Array(IPdbArrayBuffer));
    };
    a.readAsArrayBuffer(IPdbBlob);
}
function getLocation(ip) {
    try {
        if (city == null) {
            return "Null";
        } else {
            var ipinfo = city.findInfo(ip, "CN");
            return ipinfo.countryName + "-" + ipinfo.regionName + "-" + ipinfo.cityName;
        }
    } catch (error) {
        return "Null";
    }
}