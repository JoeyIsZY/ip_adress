var express = require('express');
var app = express();
var http = require('http');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

app.use('/public', express.static('public'));

app.get('/index.html', function (req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

app.get('/get_ip_location', function (req, res) {
    var html = '';
    var response = {
        "ip_address": req.query.ip_address,
    };
    console.log(response);
    locurl = "http://api.ipstack.com/" + response["ip_address"] + "?access_key=8f01d711d3486aa9167415c83437914d&format=1"
    http.get(locurl, (loc_req, loc_res) => {
        loc_req.on('data', (data) => {
            html += data;
            html = html.toString()
            html = JSON.parse(html)
            console.log(html["latitude"]);
            console.log(html["longitude"]);
        });

        MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
            if (err) throw err;
            var dbo = db.db("yzhou");
            var myobj = { ip: response["ip_address"], latitude: html["latitude"], longitude: html["longitude"] };
            dbo.collection("addresses").insertOne(myobj, function (err, res) {
                if (err) throw err;
                console.log("insert successfully");
                db.close();
            });
            res.end("Latitude: " + html["latitude"].toString() + "\r\nLongitude: " + html["longitude"].toString());
        });
    })
})

app.get('/get_history', function (req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    var html = "ip\t\tlatitude\t\tlongitude\r\n"
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("yzhou");
        dbo.collection("addresses").find({}).toArray(function (err, results) { // 返回集合中所有数据
            if (err) throw err;
            // console.log(results);
            for(i = 0; i <= results.length - 1; i++){
                result = results[i]
                html += result["ip"].toString() + "\t" + result["latitude"] + "\t" + result["longitude"] + "\r\n"
            }
            res.end(html)
            db.close();
        });
    });
})

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("http://%s:%s", host, port)

})