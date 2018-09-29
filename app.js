var request = require('request'),
    iconv = require('iconv-lite'),
    cheerio = require('cheerio'),
    async = require("async"),
    fs = require('fs'),
    mysql = require('mysql');

var autohome_root_url = "http://www.autohome.com.cn/";

var properties =
    [
        // 生产方式
        { key: "SCFS", value: "国产", url: "car/0_0-0.0_0.0-0-0-0-1-0-0-0-0" },
        { key: "SCFS", value: "进口", url: "car/0_0-0.0_0.0-0-0-0-3-0-0-0-0" },
        // 级别
        { key: "JB", value: "微型车", url: "a00/" },
        { key: "JB", value: "小型车", url: "a0/" },
        { key: "JB", value: "紧凑型车", url: "a/" },
        { key: "JB", value: "中型车", url: "b/" },
        { key: "JB", value: "中大型车", url: "c/" },
        { key: "JB", value: "大型车", url: "d/" },
        { key: "JB", value: "SUV", url: "suv/" },
        { key: "JB", value: "MPV", url: "mpv/" },
        { key: "JB", value: "跑车", url: "s/" },
        { key: "JB", value: "皮卡", url: "p/" },
        { key: "JB", value: "微面", url: "mb/" },
        { key: "JB", value: "轻客", url: "qk/" },
        // 排量
        { key: "PL", value: "1.0L及以下", url: "car/0_0-0.0_1.0-0-0-0-0-0-0-0-0/" },
        { key: "PL", value: "1.1-1.6L", url: "car/0_0-1.1_1.6-0-0-0-0-0-0-0-0/" },
        { key: "PL", value: "1.7-2.0L", url: "car/0_0-1.7_2.0-0-0-0-0-0-0-0-0/" },
        { key: "PL", value: "2.1-2.5L", url: "car/0_0-2.1_2.5-0-0-0-0-0-0-0-0/" },
        { key: "PL", value: "2.6-3.0L", url: "car/0_0-2.6_3.0-0-0-0-0-0-0-0-0/" },
        { key: "PL", value: "3.1-4.0L", url: "car/0_0-3.1_4.0-0-0-0-0-0-0-0-0/" },
        { key: "PL", value: "4.0L以上", url: "car/0_0-4.0_0.0-0-0-0-0-0-0-0-0/" },
        // 驱动
        { key: "QD", value: "前驱", url: "car/0_0-0.0_0.0-1-0-0-0-0-0-0-0/" },
        { key: "QD", value: "后驱", url: "car/0_0-0.0_0.0-2-0-0-0-0-0-0-0/" },
        { key: "QD", value: "四驱", url: "car/0_0-0.0_0.0-3-0-0-0-0-0-0-0/" },
        // 能源
        { key: "NY", value: "汽油", url: "car/0_0-0.0_0.0-0-0-0-0-1-0-0-0/" },
        { key: "NY", value: "柴油", url: "car/0_0-0.0_0.0-0-0-0-0-2-0-0-0/" },
        { key: "NY", value: "油电混合", url: "car/0_0-0.0_0.0-0-0-0-0-3-0-0-0/" },
        { key: "NY", value: "纯电动", url: "car/0_0-0.0_0.0-0-0-0-0-4-0-0-0/" },
        { key: "NY", value: "插电式混动", url: "car/0_0-0.0_0.0-0-0-0-0-5-0-0-0/" },
        // 变速箱
        { key: "BSX", value: "手动", url: "car/0_0-0.0_0.0-0-1-0-0-0-0-0-0/" },
        { key: "BSX", value: "自动", url: "car/0_0-0.0_0.0-0-2-0-0-0-0-0-0/" },
        // 国别
        { key: "GB", value: "中国", url: "car/0_0-0.0_0.0-0-0-0-0-0-1-0-0/" },
        { key: "GB", value: "德国", url: "car/0_0-0.0_0.0-0-0-0-0-0-2-0-0/" },
        { key: "GB", value: "日本", url: "car/0_0-0.0_0.0-0-0-0-0-0-3-0-0/" },
        { key: "GB", value: "美国", url: "car/0_0-0.0_0.0-0-0-0-0-0-4-0-0/" },
        { key: "GB", value: "韩国", url: "car/0_0-0.0_0.0-0-0-0-0-0-5-0-0/" },
        { key: "GB", value: "法国", url: "car/0_0-0.0_0.0-0-0-0-0-0-6-0-0/" },
        { key: "GB", value: "英国", url: "car/0_0-0.0_0.0-0-0-0-0-0-7-0-0/" },
        { key: "GB", value: "意大利", url: "car/0_0-0.0_0.0-0-0-0-0-0-8-0-0/" },
        { key: "GB", value: "瑞典", url: "car/0_0-0.0_0.0-0-0-0-0-0-9-0-0/" },
        { key: "GB", value: "荷兰", url: "car/0_0-0.0_0.0-0-0-0-0-0-10-0-0/" },
        { key: "GB", value: "捷克", url: "car/0_0-0.0_0.0-0-0-0-0-0-11-0-0/" },
        { key: "GB", value: "西班牙", url: "car/0_0-0.0_0.0-0-0-0-0-0-12-0-0/" },
        // 结构
        { key: "JG", value: "两厢", url: "car/0_0-0.0_0.0-0-0-1-0-0-0-0-0/" },
        { key: "JG", value: "三厢", url: "car/0_0-0.0_0.0-0-0-2-0-0-0-0-0/" },
        { key: "JG", value: "掀背", url: "car/0_0-0.0_0.0-0-0-3-0-0-0-0-0/" },
        { key: "JG", value: "旅行版", url: "car/0_0-0.0_0.0-0-0-4-0-0-0-0-0/" },
        { key: "JG", value: "硬顶敞篷车", url: "car/0_0-0.0_0.0-0-0-5-0-0-0-0-0/" },
        { key: "JG", value: "软顶敞篷车", url: "car/0_0-0.0_0.0-0-0-6-0-0-0-0-0/" },
        { key: "JG", value: "硬顶跑车", url: "car/0_0-0.0_0.0-0-0-7-0-0-0-0-0/" },
        { key: "JG", value: "客车", url: "car/0_0-0.0_0.0-0-0-8-0-0-0-0-0/" },
        { key: "JG", value: "货车", url: "car/0_0-0.0_0.0-0-0-9-0-0-0-0-0/" },
        // 座位
        { key: "ZW", value: "2座", url: "car/0_0-0.0_0.0-0-0-0-0-0-0-2-0/" },
        { key: "ZW", value: "3座", url: "car/0_0-0.0_0.0-0-0-0-0-0-0-3-0/" },
        { key: "ZW", value: "4座", url: "car/0_0-0.0_0.0-0-0-0-0-0-0-4-0/" },
        { key: "ZW", value: "5座", url: "car/0_0-0.0_0.0-0-0-0-0-0-0-5-0/" },
        { key: "ZW", value: "6座", url: "car/0_0-0.0_0.0-0-0-0-0-0-0-6-0/" },
        { key: "ZW", value: "7座", url: "car/0_0-0.0_0.0-0-0-0-0-0-0-7-0/" },
        { key: "ZW", value: "7座以上", url: "car/0_0-0.0_0.0-0-0-0-0-0-0-8-0/" }
    ];

var data = [];

var propertiesCounter = 0;

function fetchAZ(url, callback) {
    request({
        url: url[1],
        encoding: null
    }, function (err, res, body) {
        let bodyHtml = iconv.decode(body, "gb2312");
        let $ = cheerio.load(bodyHtml);
        let brandHtmls = $("dl");

        for (let i = 0; i < brandHtmls.length; i++) {
            let brandName = brandHtmls.eq(i).find("dt div a").text();
            let factoryNameHtmls = brandHtmls.eq(i).find("dd div.h3-tit a");
            let factorySeriesHtmls = brandHtmls.eq(i).find("dd ul");

            for (let j = 0; j < factoryNameHtmls.length; j++) {
                let factoryName = factoryNameHtmls.eq(j).text();
                let seriesHtmls = factorySeriesHtmls.eq(j).find("li");

                for (let k = 0; k < seriesHtmls.length; k++) {
                    let seriesId = seriesHtmls.eq(k).attr("id");
                    let seriesName = seriesHtmls.eq(k).find("h4 a").text();
                    let price = seriesHtmls.eq(k).find("div a.red").text();

                    if (seriesId != undefined) {
                        seriesId = seriesId.replace("s", "");
                        
                        let item = {
                            groupName: url[0],
                            brandName: brandName,
                            factoryName: factoryName,
                            seriesId: seriesId,
                            seriesName: seriesName,
                            price: price
                        };

                        data.push(item);
                    }
                }
            }
        }

        callback();
    });
}

function fetchProperty(property, callback) {
    request({
        url: autohome_root_url + property.url,
        encoding: null
    }, function (err, res, body) {
        let bodyHtml = iconv.decode(body, "gb2312");
        let $ = cheerio.load(bodyHtml);
        let brandsHtml = $("div.uibox dl");

        for (let i = 0; i < brandsHtml.length; i++) {
            let brandName = brandsHtml.eq(i).find("dt div a").text();
            let factoryNameHtmls = brandsHtml.eq(i).find("dd div.h3-tit a");
            let factorySeriesHtmls = brandsHtml.eq(i).find("dd ul");

            for (let j = 0; j < factoryNameHtmls.length; j++) {
                let factoryName = factoryNameHtmls.eq(j).text();
                let seriesHtmls = factorySeriesHtmls.eq(j).find("li");

                for (let k = 0; k < seriesHtmls.length; k++) {
                    let seriesId = seriesHtmls.eq(k).attr("id");
                    let seriesName = seriesHtmls.eq(k).find("h4 a").text();
                    let price = seriesHtmls.eq(k).find("div a.red").text();

                    if (seriesId != undefined) {
                        seriesId = seriesId.replace("s", "");
                        fetchData(seriesId, property.key, property.value);
                    }
                }
            }
        }

        callback();
    });
}

function fetchData(seriesId, key, value) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].seriesId == seriesId) {
            if (data[i][key] == undefined)
                data[i][key] = [];

            let isExists = false;

            data[i][key].forEach(element => {
                if (element == value)
                    isExists = true;
            });

            if (!isExists)
                data[i][key].push(value);
        }
    }
}

function printDetails() {
    for (let i = 0; i < data.length; i++) {
        let item = data[i];

        console.log(item.groupName + ": " + item.brandName + ": " + item.factoryName + ": " + item.seriesId + ": " + item.seriesName + ": " + item.price + ": " +
            item.JB + ": " +
            item.PL + ": " +
            item.QD + ": " +
            item.NY + ": " +
            item.BSX + ": " +
            item.GB + ": " +
            item.SCFS + ": " +
            item.JG + ": " +
            item.ZW);
    }
}

function saveDataToFile() {
    var t = JSON.stringify(data);
    fs.writeFileSync('data.json', t);
    console.log("数据已成功保存到文件。");
}

function saveDataToMySQL() {
    let values = [];

    for (let i = 0; i < data.length; i++) {
        let item = data[i];

        values.push([item.groupName, item.brandName, item.factoryName, item.seriesId, item.seriesName, item.price,
            arrayToString(item.JB), arrayToString(item.PL), arrayToString(item.QD), arrayToString(item.NY), arrayToString(item.BSX), arrayToString(item.GB), arrayToString(item.SCFS), arrayToString(item.JG), arrayToString(item.ZW)]);
    }

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'kaiba'
    });

    connection.connect();

    let sql = "insert into autohome(`group`, `brand`, `factory`, `series_id`, `series`, `price`, `jb`, `pl`, `qd`, `ny`, `bsx`, `gb`, `scfs`, `jg`, `zw`) values ?";

    connection.query(sql, [values], function (err, rows, fields) {
        if (err) {
            console.log("数据保存到数据库失败！");
            console.log("错误信息：");
            console.log(err.message);
        } else {
            console.log("数据成功保存到数据库。");
        }            
    });

    connection.end();
}

function arrayToString(a) {
    if (a != undefined && a != null)
        a = a.join("|");
    
    return a;
}

function app() {
    const prefixUrl = autohome_root_url + "grade/carhtml/";
    const suffixUrl = ".html";
    const chars = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];
    let urls = [];

    for (const char of chars) {
        url = prefixUrl + char + suffixUrl;
        urls.push([char, url]);
    }

    async.mapLimit(urls, 1, function (url, callback) {
        fetchAZ(url, callback);
    }, function (err, result) {
        console.log("完成基础数据抓取，记录数：" + data.length);
        console.log("开始抓取属性数据...");
        fetchProperties();
    });
}

function fetchProperties() {
    async.mapLimit(properties, 4, function (property, callback) {
        propertiesCounter++;
        console.log(propertiesCounter + "/" + properties.length);
        fetchProperty(property, callback);
    }, function (err, result) {
        console.log("开始保存数据...");
        saveDataToFile(); // 保存到文件
        // saveDataToMySQL(); // 保存到数据库
    });
}

app();