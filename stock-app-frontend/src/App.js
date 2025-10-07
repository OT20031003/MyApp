import React, { useState } from 'react';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// CSSをコンポーネント内に直接定義しています。
// 外部CSSファイル（例: App.css）の読み込みエラーを避けるための対応です。
const styles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f4f7f6;
    color: #333;
    padding: 20px;
  }
  /* ...CSS定義は省略... */
  .message.error {
    color: #e74c3c;
  }
`;

// 'App' という名前の関数コンポーネントを定義します。これがアプリケーションのメイン部分です。
function App() {
  // --- State（状態）の定義 ---
  // Reactの `useState` フックを使って、コンポーネントが持つ「状態」を定義します。
  // 状態が変化すると、画面が自動的に再描画されます。
  // const [状態変数, 状態を更新する関数] = useState(初期値);

  // ticker: ユーザーが入力した銘柄コードを保存する状態変数。初期値は空文字列。
  const [ticker, setTicker] = useState(''); 

  // stockData: APIから取得した株価データを保存する状態変数。初期値はnull（データなし）。
  const [stockData, setStockData] = useState(null); 

  // loading: データ取得中かどうかを示すブール値（true/false）の状態変数。初期値はfalse。
  const [loading, setLoading] = useState(false); 

  // error: エラーメッセージを保存する状態変数。初期値はnull（エラーなし）。
  const [error, setError] = useState(null); 

  // --- イベントハンドラ関数 ---
  // 「検索」ボタンがクリックされたときに実行される非同期関数を定義します。
  const handleSearch = async () => {
    // 入力欄が空のまま検索された場合、エラーメッセージを設定して処理を中断します。
    if (!ticker) {
      setError("銘柄コードを入力してください。");
      return; // returnで関数を終了させます。
    }

    // データ取得処理を開始する前の準備
    setLoading(true);      // ローディング状態をtrueにし、「検索中...」と表示させる
    setError(null);        // 以前のエラーが残っていればクリアする
    setStockData(null);    // 以前のチャートが残っていればクリアする

    // --- API通信処理 ---
    // try...catch構文で、API通信中にエラーが発生する可能性に備えます。
    try {
      // axiosライブラリを使い、バックエンドAPIにGETリクエストを送信します。
      // `await`キーワードは、APIからの応答があるまでここで処理を待つことを意味します。
      // URLの最後の部分は、ユーザーが入力した銘柄コード(ticker)に置き換えられます。
      const response = await axios.get(`http://127.0.0.1:5000/api/stock_data/${ticker}`);
      
      // バックエンドが意図的にエラーを返した場合（例: 銘柄が見つからない）の処理
      if (response.data.error) {
        setError(response.data.error); // バックエンドからのエラーメッセージを画面に表示
      } else {
        // データが正常に取得できた場合、stockDataの状態を更新します。
        // これにより、画面にチャートが描画されます。
        setStockData(response.data);
      }

    } catch (err) {
      // APIサーバーが起動していない、ネットワークに接続されていないなどの理由でリクエスト自体が失敗した場合の処理
      console.error("API request failed:", err); // 開発者向けにコンソールにエラー詳細を出力
      setError("データの取得に失敗しました。APIサーバーが起動しているか確認してください。");
    } finally {
      // `finally`ブロックは、成功しようが失敗しようが、try...catchの処理が終わった後に必ず実行されます。
      setLoading(false); // ローディング状態をfalseに戻し、ボタンを再度押せるようにします。
    }
  };

  // --- JSXによるUIの描画 ---
  // returnの中には、画面に表示するHTMLのようなものを記述します（これはJSXと呼ばれます）。
  return (
    // Reactでは複数の要素を返す場合、<> (フラグメント) または <div> などで囲む必要があります。
    <>
      {/* <style>タグを使って、このコンポーネント内だけで有効なCSSを適用します。 */}
      <style>{styles}</style>
      
      {/* classNameはHTMLのclass属性に相当します。 */}
      <div className="container">
        <h1>株価チャート表示アプリ</h1>
        
        <div className="search-bar">
          {/* input要素: テキスト入力欄 */}
          <input 
            type="text"
            value={ticker} // 表示する値は、stateの`ticker`変数と連動させます。
            // onChange: 入力内容が変わるたびに実行される関数
            onChange={(e) => setTicker(e.target.value.toUpperCase())} // 入力値を大文字に変換し、`ticker` stateを更新します。
            placeholder="銘柄コード (例: AAPL, 7203.T)"
          />
          {/* button要素: 検索ボタン */}
          <button onClick={handleSearch} disabled={loading}>
            {/* {条件 ? A : B} という三項演算子で、条件によって表示内容を変えます。 */}
            {/* loadingがtrueなら「検索中...」、falseなら「検索」と表示します。 */}
            {loading ? '検索中...' : '検索'}
          </button>
        </div>

        <div className="chart-container">
          {/* --- 条件付きレンダリング --- */}
          {/* {条件 && 表示内容} という形式で、条件がtrueの場合にのみ右側の内容を表示します。 */}
          
          {/* ローディング中(loadingがtrue)の表示 */}
          {loading && <p className="message">データを読み込んでいます...</p>}
          
          {/* エラー発生時(errorに何かメッセージが入っている)の表示 */}
          {error && <p className="message error">{error}</p>}
          
          {/* データが正常に取得できた場合(stockDataにデータが入っている)にチャートを表示 */}
          {stockData && (
            // ResponsiveContainer: 親要素のサイズに合わせてチャートを自動でリサイズしてくれます。
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={stockData} // チャートに表示するデータ配列を渡します。
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }} // グラフの余白設定
              >
                <CartesianGrid strokeDasharray="3 3" /> {/* 背景のグリッド線 */}
                <XAxis dataKey="date" /> {/* X軸。データの`date`キーを使用 */}
                <YAxis domain={['dataMin', 'dataMax']} /> {/* Y軸。データの最小値と最大値に自動で合わせる */}
                <Tooltip /> {/* マウスを乗せたときに詳細情報を表示する機能 */}
                <Legend /> {/* 凡例（「終値」などのラベル）を表示 */}
                <Line type="monotone" dataKey="close" stroke="#8884d8" name="終値" /> {/* 折れ線グラフ。データの`close`キーを使用 */}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}

// 他のファイルからこの`App`コンポーネントをimportして使えるように、エクスポートします。
export default App;

