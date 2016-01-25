window.onload = function()
{

  document.getElementById( "form" ).onchange = function()
  {
  	// 変数の宣言
  	var fileList , file , fr , result ;

  	// ファイルリストを取得
  	fileList = this.files ;

  	// 結果エリアのエレメントを取得
  	result = document.getElementById( "result" ) ;

  	// 結果エリアを一度リセット
  	result.innerHTML = "" ;

  	// ローカル画像を表示する (枚数分)
  	for( var i=0,l=fileList.length; l>i; i++ )
  	{
  		// 対象のファイルを取得
  		file = fileList[i] ;

          console.log(file);
  		// [FileReader]クラスを起動
  		fr = new FileReader() ;
      fr.readAsDataURL(file);

  		// 読み込み後の処理
  		fr.onload = function()
  		{
        textarea = document.getElementById( "textarea" );
        textarea.value = this.result.split( ',' )[1];
  			// HTMLに書き出し
  			result.innerHTML += '<img src="' + this.result + '" width="auto" height="100">' ;
  		}
  	}
  }
};
