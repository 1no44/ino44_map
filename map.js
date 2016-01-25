// Ajax
var xhr = new XMLHttpRequest();
// google map
var map;
// 吹き出し
var infowindow = new google.maps.InfoWindow();

// Ajax ハンドラの登録.
xhr.onreadystatechange = function() {
    switch ( xhr.readyState ) {
        case 0:
            // 未初期化状態.
            console.log( 'uninitialized!' );
            break;
        case 1: // データ送信中.
            console.log( 'loading...' );
            break;
        case 2: // 応答待ち.
            console.log( 'loaded.' );
            break;
        case 3: // データ受信中.
            console.log( 'interactive... '+xhr.responseText.length+' bytes.' );
            break;
        case 4: // データ受信完了.
            if( xhr.status == 200 || xhr.status == 304 ) {
                var data = xhr.responseText; // responseXML もあり
                console.log( 'COMPLETE! :'+data );
								var reports = JSON.parse(data);
								reports.forEach(function(report){
										pushPin(report);
								});

            } else {
                console.log( 'Failed. HttpStatus: '+xhr.statusText );
            }
            break;
    }
};

/**
 * 日付をフォーマットする
 * @param  {Date}   date     日付
 * @param  {String} [format] フォーマット
 * @return {String}          フォーマット済み日付
 */
var formatDate = function (date, format) {
  if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  if (format.match(/S/g)) {
    var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
    var length = format.match(/S/g).length;
    for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
  }
  return format;
};

// マップを表示
google.maps.event.addDomListener(window, 'load', function() {
	//Google Maps API初期化
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: { lat: 37.424029, lng: 137.253957 },
		zoom: 12
	});

	xhr.open( 'GET', 'http://ino44-api.herokuapp.com/reports.json', false );
	xhr.send();
	xhr.abort(); // 再利用する際にも abort() しないと再利用できないらしい.
  loadAndMappingData();


});

// 人口データと人口密度のマッピング
function loadAndMappingData() {
  // 人口データの読み込み
  d3.csv("suzu_jinkou.csv", function(error, jinkouData) {


    //ポリゴンデータのスタイルを指定
    var styleFeature = function(max){
      //カラースケールを指定
      var colorScale = d3.scale.linear().domain([0, max/10, max]).range(["#f8dcdc","#dc4e4e", "#8d1d1d"]);
      return function(feature){
        return {
          strokeWeight: 1,
          strokeColor: '#dc4e4e',
          zIndex: 4,
          fillColor: colorScale(+populationDensity(feature.getProperty("MOJI"), feature.getProperty("AREA"), jinkouData) ),　//人口密度によって色を塗り分ける
          fillOpacity: 0.5,
          visible: true
        };
      }

    }

    //geojsonデータ(ポリゴン)を読み込み
    d3.json("suzu.geojson", function(data) {

      //各県の人口密度から最大値を取得
      var max = d3.max(data.features, function(d){ return +populationDensity(d.properties["MOJI"], d.properties["AREA"], jinkouData) })

      d3.csv("suzu_jinkou.csv", function(error, data) {
        // console.log(data[0]);
      });

      //データレイヤーに追加
      map.data.addGeoJson(data);
      //データレイヤのスタイルを指定
      map.data.setStyle(styleFeature(max));
    });
  });
}

// 人口密度の取得(village 大字, area 面積, jinkouData 人口データ)
function populationDensity(village, area, jinkouData) {
  var population = 0;

  for (var i = 0; i < jinkouData.length; i++) {
    var obj = jinkouData[i];
    if ( obj["village"].indexOf(village) == 0) {
      population += Number(obj["population"]);
    }
  }

  var ret = 0
  if (area > 0) {
    ret = population / area;
  }

  if (ret > 0) {
    return ret;
  }

  return 0;
}

// マップにピンを打つ
function pushPin(report) {
  //現在地のピン
  var lat = report["latitude"];
  var lng = report["longitude"];
  var latlng = new google.maps.LatLng(lat, lng);
  var date = new Date(report["date_reported"]);
  console.log(date);
  var dateFormatted = formatDate(date,"YYYY/MM/DD hh時mm分");
  var marker = new google.maps.Marker({
    position:latlng,
    map: map
  });
  //var image = "http://www.dummyimage.com/160x120";

  google.maps.event.addListener(marker, 'click', function() {

    var html = "";
    html += "<div style='width:200px;'>"
    html += "<h4>" + dateFormatted + "</h4>"
    html += "<p>" + report["comment"] + "</p>"
    // html += "<p style='text-align:center'><img src='" + image + "' width='160' height='120'></p>";
    //
    // html += "<dt>特典内容</dt><dd>" + description + "</dd>";
    // html += "</dl>";
    html += "</div>";
    infowindow.setContent(html);
    infowindow.open(map, marker);
  });
}
