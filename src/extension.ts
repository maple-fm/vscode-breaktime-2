// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import { countReset } from 'console';
import { EndOfLineState } from 'typescript';
import * as vscode from 'vscode';
import * as path from 'path';

const MINITES = 0; // m
const SECONDS = 30; // s
const INTERVAL = 30000; // ms : 30秒

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-breaktime" is now active!');

	let charcount = new CharCount();
	let countEventCont = new CountEventControler(charcount);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	let disposable = vscode.commands.registerCommand('vscode-breaktime.helloWorld', () => {

		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		setTimeout(startbreak, INTERVAL, context);

	});

	context.subscriptions.push(disposable);


	// リソース解放
	//context.subscriptions.push(disposable);
	context.subscriptions.push(countEventCont);

}

// this method is called when your extension is deactivated
export function deactivate() {}

// 文字をカウントするクラス
export class CharCount{
	private _stringNum: number = 0; // 現在の文字数
	private _lineNum: number = 0; // 現在の行数
	private _fileName: String = "none"; // 現在のファイル名
	private _nowFileNum: number = 0; // 現在操作するファイルの番号

	private _assenblyStrNum: Array<number> = []; // 各ファイルごとの文字数
	private _assenblyLineNum: Array<number> = []; // 各ファイルごとの行数
	private _assenblyFileName: Array<String> = []; // 各ファイルの名前

	/**	public
		エディタ情報を更新するメソッド
		引数 なし;
		返り値 なし
	 **/
	public updateCount(){
		let editor = vscode.window.activeTextEditor; // 現在開いているエディタ情報を格納
		if(!editor){ // "editor"がundefinedである場合
			return;
		}

		let document = editor?.document; // editorのドキュメント


		this._stringNum = this.getNumChar(document); // 文字数を更新
		this._lineNum = document.lineCount; // 行数を更新
		this._fileName = document.fileName; // ファイル名を更新

		// assenbly内にdocumentのファイルがあるかどうか
		if(this.searchFileName(this._fileName)){
			this._assenblyStrNum[this._nowFileNum] = this._stringNum; // 文字数を更新
			this._assenblyLineNum[this._nowFileNum] = this._lineNum; // 行数を更新
		}
		else{
			this._assenblyStrNum.push(this._stringNum); // 文字数を新たに追加
			this._assenblyLineNum.push(this._lineNum); // 行数を新たに追加
			this._assenblyFileName.push(this._fileName); // ファイル名を新たに追加

			this._nowFileNum = this._assenblyFileName.length - 1; // 現在のファイルを更新
		}

		//console.log(this._fileName + " ..." + "charactors:" + this._stringNum + " lines:" + this._lineNum); // コンソールに現在のファイルの情報を追加
		console.log("sum..." + " charactors: " + this.returnStrNum() + " lines" + this.returnLineNum());

	}

	/** private
		引数であるドキュメントの文字数を返すメソッド
		引数 document (vscode.TextDocument型);
		返り値 strNum (number型) ... 文字数
	**/
	private getNumChar(document: vscode.TextDocument): number {
		let strDoc = document.getText(); // ドキュメントの文字をString型で所得
		let strNum : number = 0; // 文字数を格納するnumber型の変数

		strDoc = strDoc.replace(/\s/g, ''); // 全ての空白を消す(正規表現 \s:空白, オプション  g:文字列全体)

		if(strDoc !== ""){
			strNum = strDoc.length; // strDocの文字数をstrNumに格納
		}

		return strNum;
	}

	/** public
		引数にファイル名が格納されていれば，そのファイルの文字数を，
		格納されて居なければ全てのファイルの合計文字数を返す
		引数 name(String型)...ファイル名;
		返り値 number(number型)...文字数
	**/
	public returnStrNum(name?: String): number{
		let number = 0; // 返り値用

		if(!name){ // 引数の記述がない場合
			let sum = 0; // 文字数の合計

			// 全ての文字数を求める
			for(let i = 0; i < this._assenblyFileName.length; i++){
				sum += this._assenblyStrNum[i]; // i の時のassenblyStrNumの数を足す
			}

			number = sum; // 返り値用の変数に合計を格納
		}
		else{
			if(this.searchFileName(name)){
				number = this._assenblyStrNum[this._nowFileNum];
			}
			else{
				number = 0;
			}
		}

		return number;
	}

	/** public
	 *	引数にファイル名が格納されていれば，そのファイルの行数を，
	 *	格納されて居なければ全てのファイルの合計行数を返す.
	 *	引数 name(String型)...ファイル名;
	 *	返り値 number(number型)...文字数
	**/
	public returnLineNum(name?: String){
		let number = 0; // 返り値用

		if(!name){ // 引数の記述がない場合
			let sum = 0; // 文字数の合計

			// 全ての文字数を求める
			for(let i = 0; i < this._assenblyFileName.length; i++){
				sum += this._assenblyLineNum[i]; // i の時のassenblyStrNumの数を足す
			}

			number = sum; // 返り値用の変数に合計を格納
		}
		else{
			if(this.searchFileName(name)){
				number = this._assenblyLineNum[this._nowFileNum];
			}
			else{
				number = 0;
			}
		}

		return number;
	}

	/**
	 * ファイル名をまとめて返すメソッド
	 * 返り値 (String[]型)
	 */
	public returnFileName(): String[]{
		return this._assenblyFileName;
	}

	/**	private
		引数のファイル名と同じファイル名が格納されているかを確認し格納されていればtrue
		格納されていなければfalseを返すメソッド
		引数 name(String型) ... ファイル名;
		返り値 (boolean型)
	**/
	private searchFileName(name: String): boolean{
		for(let i = 0; i < this._assenblyFileName.length; i++){
			// iの時の_assenblyFileNameとnameが一致する時
			if(name === this._assenblyFileName[i]){
				this._nowFileNum = i; // 現在のファイルの場所を格納
				return true; // trueを返す
			}
		}

		return false; // falseを返す
	}
}

/**
 * 入力イベントを管理するクラス
 */
class CountEventControler{
	private _charcount: CharCount;
	private _disposable: vscode.Disposable;

	constructor(charcount: CharCount){
		this._charcount = charcount; // 引数のものを代入
		this._charcount.updateCount(); // エディタ情報を更新

		let subscriptions: vscode.Disposable[] = [];

		vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions); // エディタが移ると_onEventを動作
		vscode.window.onDidChangeVisibleTextEditors(this._onEvent, this, subscriptions); // エディタ分割の際に_onEventを動作
		vscode.window.onDidChangeWindowState(this._onEvent, this, subscriptions); // window単位のfocusが移ると_onEvent
		vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions); // カーソル動くと動作

		this._disposable = vscode.Disposable.from(...subscriptions);
	}

	private _onEvent(){
		this._charcount.updateCount();
	}

	public dispose(){
		this._disposable.dispose();
	}
}


/*
*タイマーをセットする
*/
function startbreak(context: vscode.ExtensionContext){
	vscode.window.showInformationMessage('休憩してください！', {
		modal: true,
	});

	const kyuukeiFigures = {'休憩': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEibNNjxJIu-0NU_bkVjslf6-CN7u6VGUUQsst4_-_PhGbaASpwuoDsF6fvtliWir7rfrB45XGZHdEbVCAp1utUWG7dhfWDp2-DG_r3-s0agCs5srD2qqRjaQdYXYE-iBd2BGloB_J62bjZYJ0pGdIAQsyMMNTCbJtaqVeUYtwfxB1SmxoNB-qQMQSGp/s1000/11792.gif'};

	function getWebviewContent(kyuukeiResult: keyof typeof kyuukeiFigures) {
		return `<!DOCTYPE html>
		<html lang="ja">
		<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body>
		<img src="${kyuukeiFigures[kyuukeiResult]}" />
		</body>
		</html>`;
	}
	const kyuukeiCandidates = ['休憩'] as const;
	const kyuukeiResult = kyuukeiCandidates[Math.floor(Math.random() * kyuukeiCandidates.length)];
	const panel = vscode.window.createWebviewPanel('breaktime',`お疲れ様です。${kyuukeiResult}のお時間です！`,vscode.ViewColumn.One,{});
	panel.webview.html = getWebviewContent(kyuukeiResult);

	// webviewはローカルリソースに直接アクセスできないらしい
	// 読み込みたいときはWebview.asWebviewUri関数を使って、読み込める形に変換しないといけない
	// https://code.visualstudio.com/api/extension-guides/webview#loading-local-content
	// Create and show a new webview
	const panell = vscode.window.createWebviewPanel(
		'Graph', // Identifies the type of the webview. Used internally
		'test area', // Title of the panel displayed to the user
		vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
		{enableScripts: true} // Webview options. More on these later.
	);

	const graphPath = vscode.Uri.file(
		path.join(context.extensionPath, 'src', 'graph.js')
	);
	const graphSrc = panell.webview.asWebviewUri(graphPath);

	panell.webview.html = getWebviewContents(graphSrc);



	timer(MINITES,SECONDS, context);// 分：秒
}

/*
*タイマー開始
*/
function timer(min: number, sec: number, context: vscode.ExtensionContext){

	if(sec - 1 === -1){
		min --;
		sec = 59;
	}
	else{
		sec --;
	}
	console.log(min, sec);
	// vscode.window.showInformationMessage("残り"+min+ "分"+sec+"秒です!");
	vscode.window.setStatusBarMessage("残り"+min+ "分"+sec+"秒です!", min*60000+sec*1000);
	var id = setTimeout(timer, 1000, min, sec, context);
	// var id = setInterval(timer, 2000, min, sec);

	// 終了
	if(min < 0 ){
		clearTimeout(id);
		vscode.window.showInformationMessage('休憩終了です！', {
			modal: true,
		});
		setTimeout(startbreak, INTERVAL, context);
	}

}

function getWebviewContents(graphSrc: vscode.Uri){
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>title</title>
	</head>
	<body>
		<h1>title</h1>

		<div class=""><input type="radio" name="analysis" value="bar" checked>縦棒グラフ</div>
		<div class=""><input type="radio" name="analysis" value="Line">折れ線グラフ</div>
		<div class=""><input type="radio" name="analysis" value="3">散布図</div>

		<div>
			<canvas id="graph" width="100%"></canvas>
		</div>

		<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.js"></script>
		<script src=` + graphSrc + `></script>
	</body>
	</html>
	`;
}
