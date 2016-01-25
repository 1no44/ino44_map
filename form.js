var image_base64;
var comment;
var latitude;
var longitude;
var date_reported;

// Ajax
var xhr = new XMLHttpRequest();

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
            if(xhr.status == 201) {
                var data = xhr.responseText;
                console.log( 'COMPLETE! :'+data );
            } else {
                console.log( 'Failed. HttpStatus: '+xhr.statusText );
            }
            break;
    }
};

window.onload = function()
{

  document.getElementById( "file" ).onchange = function()
  {
  	// 変数の宣言
  	var fileList , file , fr , result ;

    	// 対象のファイルを取得
  	file = this.files[0] ;

  	// 結果エリアのエレメントを取得
  	result = document.getElementById( "result" ) ;

  	// 結果エリアを一度リセット
  	result.innerHTML = "" ;

		// [FileReader]クラスを起動
		fr = new FileReader() ;
    fr.readAsDataURL(file);

		// 読み込み後の処理
		fr.onload = function()
		{
      textarea = document.getElementById( "image_base64" );
      image_base64 = this.result.split( ',' )[1];
      textarea.value = image_base64;

			// HTMLに書き出し
			result.innerHTML += '<img src="' + this.result + '" width="auto" height="100">' ;
		}
  }

  document.getElementById( "latitude" ).onchange = function() {
    latitude = this.value
    console.log(latitude);
  }

  document.getElementById( "longitude" ).onchange = function() {
    longitude = this.value
    console.log(longitude);
  }

  document.getElementById( "comment" ).onchange = function() {
    comment = this.value
    console.log(comment);
  }

  document.getElementById( "date_reported" ).onchange = function() {
    date_reported = this.value
    console.log(date_reported);
  }

  document.getElementById( "send" ).onclick = function() {
    var obj = {report: {latitude: latitude, longitude: longitude, comment: comment, date_reported: date_reported, image_base64: image_base64}};
    // console.log(JSON.stringify(obj));


    xhr.open( 'POST', apiUrl + '/reports.json', false );
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(obj));
    xhr.abort();
  }
};
