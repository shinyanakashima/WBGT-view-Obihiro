import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [bgcolor, setBgColor] = useState('#ffffff');
  const [maxKey, setMaxKey] = useState(null);
  const [maxValue, setMaxValue] = useState(null);
  const [wgbtLevel, setWgbtLevel] = useState("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // APIから全データ取得
        const resp = await axios.get("https://6ealbffjxfgzo4r3kuiac7txry0bnwbm.lambda-url.us-east-1.on.aws/");

        // 現在日付をキーとして使用
        const dateKey = new Date().toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).replaceAll('/', '');

        const todayData = resp.data[dateKey];
        if (!todayData) return;

        // 最大値とそのキーを計算
        const { maxKey, maxValue } = Object.entries(todayData).reduce((acc, [key, value]) => {
          if (value > acc.maxValue) {
            return { maxKey: key, maxValue: value };
          }
          return acc;
        }, { maxKey: null, maxValue: -Infinity });

        // ステート更新（→ Reactが1回だけ再描画）
        setMaxKey(maxKey);
        setMaxValue(maxValue);

        if (maxValue >= 31) {
          setBgColor('#ff2800');       // 赤
          setWgbtLevel("危険");
        } else if (maxValue >= 28) {
          setBgColor('#ff9600');       // 橙
          setWgbtLevel("厳重警戒");
        } else if (maxValue >= 25) {
          setBgColor('#faf500');       // 黄
          setWgbtLevel("警戒");
        } else {
          setBgColor('#a0d2ff');       // 青
          setWgbtLevel("注意");
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData(); // 初回実行

    const timerId = setInterval(fetchData, 60000); // 60秒おきに実行

    return () => clearInterval(timerId); // クリーンアップ（アンマウント時）
  }, []); // 依存なし：初回マウント時のみ useEffect 実行

  return (
    <div className="App" style={{ backgroundColor: bgcolor }}>
      <header className="App-header">
        <section>熱中症予測@十勝　今日これからの最高WGBT</section>
      </header>
      <main className="App-main">
        {maxValue !== null && maxKey !== null && (
          <section>
            <div className="App-main-example">{maxKey}時頃に</div>
            <div className="App-main-caution">
              <p> {wgbtLevel} : {maxValue} ℃</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
