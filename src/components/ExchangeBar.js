import React, { useState } from 'react';
function ExchangeBar({
  title,
  balance,
  average,
  max,
  min,
  critical,
  color,
  stableCoin,
  setBalance
}) {
  const [addFund, setAddFund] = useState(0);
  const minLine = (min * 100 / max);
  const criticalLine = (critical * 100 / max);
  const addToBalance = () => {
    setBalance(balance + parseInt(addFund));
    setAddFund(0)
  }
  return (
    <div className="exchange-bar-container">
      <p><strong>{title}</strong></p>
      <p>{balance.toFixed(2)} {stableCoin}</p>
      <div className="exchange-bar">
        <div
          className="exchange-balance-bar"
          style={{
            height: (balance * 100 / max) + '%',
            backgroundColor: color
          }}
        />
        <div
          className="exchange-min-line"
          style={{
            bottom: minLine + '%'
          }}
        >
          <span className="exchange-min-line-text">{min?.toFixed(2)} {stableCoin}</span>
        </div>
        <div
          className="exchange-critical-line"
          style={{
            bottom: criticalLine + '%'
          }}
        >
          <span className="exchange-critical-line-text">{critical?.toFixed(2)} {stableCoin}</span>
        </div>
      </div>
      <div>
        <input type="number" value={addFund} onChange={(e) => setAddFund(e.target.value)} />
        <input type="button" value="Añadir fondos" onClick={addToBalance} />
      </div>
    </div>
  );
}

export default ExchangeBar;
