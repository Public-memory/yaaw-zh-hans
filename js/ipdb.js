class City {

    constructor(dbfile) {
        this.db = new Reader(dbfile);
    }

    findInfo(addr, language) {
        var data = this.db.find(addr, language);
        if (data.length > 0) {
            return new CityInfo(data);
        } else {
            return null;
        }
    }
}

class CityInfo {

    constructor(data) {
        var size = data.length;
        this.countryName = getItem(data, size, 1);
        this.regionName = getItem(data, size, 2);
        this.cityName = getItem(data, size, 3);
        this.ownerDomain = getItem(data, size, 4);
        this.ispDomain = getItem(data, size, 5);
        this.latitude = getItem(data, size, 6);
        this.longitude = getItem(data, size, 7);
        this.timezone = getItem(data, size, 8);
        this.utcOffset = getItem(data, size, 9);
        this.chinaAdminCode = getItem(data, size, 10);
        this.iddCode = getItem(data, size, 11);
        this.countryCode = getItem(data, size, 12);
        this.continentCode = getItem(data, size, 13);
        this.idc = getItem(data, size, 14);
        this.baseStation = getItem(data, size, 15);
        this.countryCode3 = getItem(data, size, 16);
        this.europeanUnion = getItem(data, size, 17);
        this.currencyCode = getItem(data, size, 18);
        this.currencyName = getItem(data, size, 19);
        this.anycast = getItem(data, size, 20);
    }
}

function getItem(items, size, index) {
    return size >= index ? items[index - 1] : '';
}


class Reader {
    constructor(data) {//传入byte数组
        var metaLength = this.bytes2long(data[0], data[1], data[2], data[3]);
        var metabuf = data.slice(4, 4 + metaLength);
        this.meta = JSON.parse(this.Uint8ArrayToString(metabuf));
        this.body = data.slice(metaLength + 4, data.length);
        this.v4offset = 0;
        if (this.meta.total_size + 4 + metaLength != data.length) {
            console.log("error");
            throw Error("database file size error");
        }
    }
    bytes2long(a, b, c, d) {
        return (a << 24) | (b << 16) | (c << 8) | d;
    }
    // UTF8 and ascii
    Uint8ArrayToString(array) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = array.length;
        i = 0;
        while (i < len) {
            c = array[i++];
            switch (c >> 4) {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                    // 0xxxxxxx
                    out += String.fromCharCode(c);
                    break;
                case 12: case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = array[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
            }
        }
        return out;
    }

    _readNode(node, idx) {
        var off = idx * 4 + node * 8;
        return this.bytes2long(
            this.body[off],
            this.body[off + 1],
            this.body[off + 2],
            this.body[off + 3]
        );
    }

    findNode(addr) {

        var bit_count = 0;
        // var ipv = ip.parse(addr)
        var ipv = (ipaddr.parse(addr)).toByteArray()
        if (ipv.length == 16) {
            bit_count = 128
        } else {
            bit_count = 32
        }

        var idx = 0
        var node = 0
        if (bit_count == 32) {
            if (this.v4offset == 0) {
                var i = 0
                while (i < 96) {
                    if (i >= 80) {
                        node = this._readNode(node, 1)
                    } else {
                        node = this._readNode(node, 0)
                    }
                    i += 1
                }

                this.v4offset = node;
            } else {
                node = this.v4offset;
            }
        }

        while (idx < bit_count) {
            if (node > this.meta.node_count) {
                break;
            }

            node = this._readNode(node, (1 & (ipv[idx >> 3] >> 7 - (idx % 8))))
            idx += 1
        }

        if (node > this.meta.node_count) {
            return node;
        } else {
            return -1;
        }
    }

    resolveNode(node) {
        var resolved = node - this.meta.node_count + this.meta.node_count * 8;
        var size = this.bytes2long(0, 0, this.body[resolved], this.body[resolved + 1])
        if ((resolved + 2 + size) > this.body.length) {
            console.log(node);
            console.log(resolved);
            console.log(size);
            console.log(this.body.length);
            throw Error("database is error");
        }
        var buf = this.body.slice(resolved + 2, resolved + 2 + size)
        return buf
    }

    isIPv4() {
        return (this.meta.ip_version & 0x01) == 0x01;
    }
    isIPv6() {
        return (this.meta.ip_version & 0x02) == 0x02;
    }
    validIPAddress(IP) {
        var ipv4 = /^((\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.){4}$/;
        var ipv6 = /^(([\da-fA-F]{1,4}):){8}$|^(([\da-fA-F]{1,4}):){1}:(([\da-fA-F]{1,4}):){1,6}$|^(([\da-fA-F]{1,4}):){2}:(([\da-fA-F]{1,4}):){1,5}$|^(([\da-fA-F]{1,4}):){3}:(([\da-fA-F]{1,4}):){1,4}$|^(([\da-fA-F]{1,4}):){4}:(([\da-fA-F]{1,4}):){1,3}$|^(([\da-fA-F]{1,4}):){5}:(([\da-fA-F]{1,4}):){1,2}$|^(([\da-fA-F]{1,4}):){6}:(([\da-fA-F]{1,4}):){1}|^::(([\da-fA-F]{1,4}):){1,7}$|^(([\da-fA-F]{1,4}):){1,7}::$/
        // return ipv4.test(IP + ".") ? "IPv4" : ipv6.test(IP + ":") ? "IPv6" : "Neither";
        return ipv4.test(IP + ".") ? 4 : ipv6.test(IP + ":") ? 6 : 0;
    };
    find(addr, language) {
        if (language === undefined) {
            throw Error("param language is undefined");
        }
        if (this.validIPAddress(addr) == 0) {
            throw Error("addr error");
        }
        else if (this.validIPAddress(addr) == 4 && !this.isIPv4()) {
            throw Error("database not support ipv4");
        } else if (this.validIPAddress(addr) == 6 && !this.isIPv6()) {
            throw Error("database not support ipv6");
        }
        var node = this.findNode(addr);
        if (node <= 0) {
            return [];
        }
        var buf = this.resolveNode(node);
        // var tmp = buf.toString().split("\t");
        var tmp = (this.Uint8ArrayToString(buf)).split("\t");
        var off = this.meta.languages[language];

        return tmp.slice(off, off + this.meta.fields.length);
    }
}
//need ipaddr.min.js