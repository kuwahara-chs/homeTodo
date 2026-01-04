import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot
} from "recharts";

const initialPrice = 100;

// 単位定義
const LOT_SIZE = 1000;        // 1Lot = 1000株
const LOT_UNIT = 1000;        // 1操作 = 1000 Lot
const MONEY_UNIT = 100000000; // 1億円
const WINDOW_SIZE = 50;

export default function App() {
  const [price, setPrice] = useState(initialPrice);
  const [trend, setTrend] = useState("下降トレンド");
  const [money, setMoney] = useState(1000000000);
  const [lot, setLot] = useState(1);
  const [position, setPosition] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);

  const [chartData, setChartData] = useState(
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      time: i,
      price: initialPrice
    }))
  );

  const [buyPoints, setBuyPoints] = useState([]);
  const [logs, setLogs] = useState([]);

  // ------------------------
  // 価格更新
  // ------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setPrice(prev => {
        const diff = Math.floor(Math.random() * 61 - 30);
        const next = Math.max(1, prev + diff);

        setTrend(diff >= 0 ? "上昇トレンド" : "下降トレンド");

        setChartData(data => {
          const newData = data.slice(1);
          newData.push({
            time: data[data.length - 1].time + 1,
            price: next
          });

          setBuyPoints(points =>
            points.filter(p => p.time >= newData[0].time)
          );

          return newData;
        });

        return next;
      });
    }, 500);

    return () => clearInterval(timer);
  }, []);

  // ------------------------
  // 買う
  // ------------------------
  const buy = () => {
    const realLot = lot * LOT_UNIT;
    const cost = price * realLot * LOT_SIZE;
    if (money < cost) return;

    const totalCost =
      avgPrice * position * LOT_UNIT * LOT_SIZE +
      price * realLot * LOT_SIZE;

    const newPos = position + lot;

    setMoney(m => m - cost);
    setAvgPrice(totalCost / (newPos * LOT_UNIT * LOT_SIZE));
    setPosition(newPos);

    const t = chartData[chartData.length - 1].time;
    setBuyPoints(p => [...p, { time: t, price }]);

    setLogs(l => [
      {
        type: "buy",
        text: `${realLot} Lot を ${price.toFixed(2)} 円で購入`
      },
      ...l
    ]);
  };

  // ------------------------
  // 売る
  // ------------------------
  const sell = () => {
    if (position < lot) return;

    const realLot = lot * LOT_UNIT;
    const profit =
      (price - avgPrice) * realLot * LOT_SIZE;

    setMoney(m => m + price * realLot * LOT_SIZE);
    setPosition(p => p - lot);

    if (position - lot === 0) setAvgPrice(0);

    setLogs(l => [
      {
        type: profit >= 0 ? "profit" : "loss",
        text: `${realLot} Lot 売却 → ${
          profit >= 0 ? "+" : ""
        }${profit.toLocaleString()} 円`
      },
      ...l
    ]);
  };

  return (
    <div style={{ display: "flex", padding: 20 }}>
      {/* チャート */}
      <div>
        <h2 style={{ color: trend === "上昇トレンド" ? "blue" : "red" }}>
          {trend}
        </h2>
        <h3>価格：{price.toFixed(2)} 円</h3>

        <LineChart width={520} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />

          <Line
            type="linear"
            dataKey="price"
            stroke="#00ff00"
            dot={false}
            isAnimationActive={false}
          />

          {buyPoints.map((p, i) => (
            <ReferenceDot
              key={i}
              x={p.time}
              y={p.price}
              r={5}
              fill="blue"
            />
          ))}
        </LineChart>
      </div>

      {/* 操作 + ログ */}
      <div style={{ marginLeft: 30, width: 320 }}>
        <h2>
          {lot} Lot
          <br />
          <small>(1操作 = 1000 Lot)</small>
        </h2>

        <button onClick={() => setLot(l => Math.max(1, l - 1))}>−</button>
        <button onClick={() => setLot(l => l + 1)}>＋</button>

        <div style={{ marginTop: 10 }}>
          <button
            style={{ background: "blue", color: "#fff", width: 100 }}
            onClick={buy}
          >
            買う
          </button>
          <button
            style={{
              background: "red",
              color: "#fff",
              width: 100,
              marginLeft: 10
            }}
            onClick={sell}
          >
            売る
          </button>
        </div>

        <hr />

        <p>保有Lot：{position * LOT_UNIT}</p>
        <p>平均取得価格：{avgPrice.toFixed(2)} 円</p>
        <h3>資産：{(money / MONEY_UNIT).toFixed(2)} 億円</h3>

        <hr />
        <h3>📜 ログ</h3>
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {logs.map((log, i) => {
            const isBuy = log.type === "buy";
            const isSell = log.type === "profit" || log.type === "loss";

            return (
              <div
                key={i}
                style={{
                  color: isBuy
                    ? "blue"
                    : log.type === "profit"
                    ? "green"
                    : "red",
                  fontSize: 13
                }}
              >
                {isBuy && "□BUY "}
                {isSell && "△SELL "}
                {log.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}












