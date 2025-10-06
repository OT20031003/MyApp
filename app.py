import yfinance as yf
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd # pandasを明示的にインポート

# Flaskアプリケーションを初期化
app = Flask(__name__)
# CORS(Cross-Origin Resource Sharing)を有効にする
CORS(app) 

@app.route("/api/stock_data/<ticker>")
def get_stock_data(ticker):
    """
    指定された銘柄コード(ticker)の過去の株価データを取得するAPIエンドポイント
    """
    try:
        # yfinanceを使って銘柄データを取得
        stock = yf.Ticker(ticker)

        # 過去1年分(period="1y")の日足(interval="1d")データを取得
        hist = stock.history(period="1y", interval="1d")

        # ★★★ 修正点1: 取得したデータが空でないかチェック ★★★
        # 銘柄が存在しない、またはその期間のデータがない場合、空のDataFrameが返ることがある
        if hist.empty:
            return jsonify({"error": f"No data found for ticker '{ticker}'. It might be an invalid ticker or delisted."}), 404

        # フロントエンドで扱いやすいように、日付(インデックス)をリセットして列に追加
        hist_df = hist.reset_index()
        
        # ★★★ 修正点2: 日付のフォーマットを文字列に変換 ★★★
        # JSONに変換する際にタイムゾーン情報で問題が起きるのを防ぐため、
        # 'YYYY-MM-DD' 形式の文字列に変換します。
        hist_df['Date'] = hist_df['Date'].dt.strftime('%Y-%m-%d')

        # 不要な列を削除し、列名をフロントエンドで分かりやすいように調整
        hist_df = hist_df.drop(columns=['Dividends', 'Stock Splits'])
        hist_df = hist_df.rename(columns={
            "Date": "date",
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume"
        })
        
        return jsonify(hist_df.to_dict(orient="records"))

    # ★★★ 修正点3: エラーメッセージに詳細情報を含める ★★★
    except Exception as e:
        # 発生した例外(e)の具体的な内容を文字列として含めることで、デバッグが容易になります。
        return jsonify({"error": f"Failed to retrieve data for {ticker}. Detail: {str(e)}"}), 500

if __name__ == '__main__':
    # 開発サーバーを起動
    app.run(debug=True)
