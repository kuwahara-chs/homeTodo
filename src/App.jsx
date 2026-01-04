import { useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import "./App.css";

// ------------------------
// 鉱石データ
// ------------------------
const ores = [
  { name: "銅", key: "copper", probability: 0.25, color: "#c47f3c" },
  { name: "鉄", key: "iron", probability: 0.125, color: "#888888" },
  { name: "銀", key: "silver", probability: 0.0625, color: "#cccccc" },
  { name: "金", key: "gold", probability: 0.03125, color: "#ffd700" },
  { name: "エメラルド", key: "emerald", probability: 0.015625, color: "#50c878" },
  { name: "ダイヤ", key: "diamond", probability: 0.0078125, color: "#7df9ff" }
];

// ------------------------
// グラフ用に「価格の歴史」を保存するデータ
// ------------------------
const initialChart = [
  { time: 1, copper: 10, iron: 20, silver: 40, gold: 80, emerald: 200, diamond: 500 }
];

export default function App() {
  // 所持金
  const [money, setMoney] = useState(1000);

  // 在庫
  const [inventory, setInventory] = useState({
    copper: 0,
    iron: 0,
    silver: 0,
    gold: 0,
    emerald: 0,
    diamond: 0
  });

  // 現在の鉱石価格
  const [prices, setPrices] = useState({
    copper: 10,
    iron: 20,
    silver: 40,
    gold: 80,
    emerald: 200,
    diamond: 500
  });

  // グラフ用の価格履歴
  const [chartData, setChartData] = useState(initialChart);

  let time = chartData.length + 1;

  // ------------------------
  // 掘る処理
  // ------------------------
  const handleDig = () => {
    const r = Math.random();
    let sum = 0;

    for (let ore of ores) {
      sum += ore.probability;

      if (r < sum) {
        const price = prices[ore.key];

        if (money < price) {
          alert(`${ore.name} を掘るための資金（${price}円）が足りません！`);
          return;
        }

        // お金を減らす
        setMoney(prev => prev - price);

        // 在庫を増やす
        setInventory(prev => ({
          ...prev,
          [ore.key]: prev[ore.key] + 1
        }));

        alert(`${ore.name} を掘った！ -${price}円`);

        // ★価格がランダムで変動
        const newPrices = {
          ...prices,
          [ore.key]: prices[ore.key] + Math.floor(Math.random() * 41 - 20) // -20〜+20
        };
        setPrices(newPrices);

        // ★グラフに新しい値を追加
        const newRow = { time };
        for (let o of ores) newRow[o.key] = newPrices[o.key];
        setChartData(prev => [...prev, newRow]);

        return;
      }
    }
  };

  // ------------------------
  // 売る処理
  // ------------------------
  const handleSell = (oreKey) => {
    if (inventory[oreKey] <= 0) {
      alert("在庫がありません！");
      return;
    }

    setInventory(prev => ({
      ...prev,
      [oreKey]: prev[oreKey] - 1
    }));

    setMoney(prev => prev + prices[oreKey]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>鉱石売買ゲーム</h1>

      <h2>所持金：{money} 円</h2>

      <button onClick={handleDig}>掘る！</button>

      <h3>在庫</h3>
      {ores.map(ore => (
        <div key={ore.key} style={{ marginBottom: 10 }}>
          {ore.name}：{inventory[ore.key]} 個
          <button
            onClick={() => handleSell(ore.key)}
            style={{ marginLeft: 10 }}
            disabled={inventory[ore.key] <= 0}
          >
            売る（{prices[ore.key]}円）
          </button>
        </div>
      ))}

      <hr />

      <h2>価格推移グラフ</h2>
      <div className="dashboard">
        {ores.map((ore) => (
          <div className="card" key={ore.key}>
            <h3>{ore.name}</h3>
            <LineChart width={330} height={220} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={ore.key}
                stroke={ore.color}
                strokeWidth={2}
              />
            </LineChart>
          </div>
        ))}
      </div>
    </div>
  );
}
