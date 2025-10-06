import yfinance as yf
import numpy as np
from sklearn.linear_model import LinearRegression

def predict_stock(symbol="AAPL"):
    # 株価データ取得
    data = yf.download(symbol, period="1mo", interval="1d")['Close']
    X = np.arange(len(data)).reshape(-1, 1)
    y = data.values

    # 線形回帰モデルで予測
    model = LinearRegression().fit(X, y)
    next_day = model.predict([[len(data)]])[0]

    return round(next_day, 2)

if __name__ == "__main__":
    print("Predicted price:", predict_stock("AAPL"))
