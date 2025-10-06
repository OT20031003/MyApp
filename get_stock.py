import yfinance as yf

# 例: Appleの1か月分の日次データを取得
data = yf.download("AAPL", period="1mo", interval="1d")
print(data.tail())
