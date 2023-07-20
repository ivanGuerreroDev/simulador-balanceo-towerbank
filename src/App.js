import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

// Components
import ExchangeBar from './components/ExchangeBar';
import Tabla from './components/Tabla';

function App() {
  const [exchanges, setExchanges] = useState([
    {
      title: 'Binance',
      balance: 1500,
      color: '#f7931a',
      stableCoin: 'USDT'
    },
    {
      title: 'Bitstamp',
      balance: 1200,
      color: '#2aabe4',
      stableCoin: 'USDT'
    },
    {
      title: 'Kraken',
      balance: 1350,
      color: '#4b275f',
      stableCoin: 'USDT'
    },
  ])
  const [critical, setCritical] = useState(50);
  const [minPercent, setPercent] = useState(35);
  const [max, setMax] = useState(0);
  const [min, setMin] = useState(0);
  const [average, setAverage] = useState(0);

  const [buyForm, setBuyForm] = useState({
    exchange: '',
    amount: 0
  })

  const [trxs, setTrxs] = useState([]); // [{balancing: '19/7/2023 10:30 PM', from: 'Binance', to: 'Bitstamp', amount: 100}

  const calcAverage = () => {
    let sum = 0;
    exchanges.forEach(exchange => {
      sum += exchange.balance;
    });
    let calcExchanges = sum / exchanges.length
    setAverage(calcExchanges);
    setMin(minPercent * calcExchanges / 100);
    setMax(Math.max(...exchanges.map(o => o.balance)));
  }



  const validateBalanceToBuy = (amount) => {
    let newExchanges = [...exchanges];
    let totalBalance = newExchanges.reduce(function (a, b) {
      if(typeof a === 'object') {
        return a.balance + b.balance;
      } else {
        return a + b.balance;
      }
    });
    if (totalBalance >= amount) {
      return true;
    } else {
      return false;
    }
  }

  const validateExchageNeedBalance = (exchange, amount) => {
    let newExchanges = [...exchanges];
    let exchangeNeedBalance = newExchanges.find(ex => ex.title.toUpperCase() === exchange.toUpperCase());
    if (exchangeNeedBalance?.balance < amount) {
      return true;
    }
    return false;
  }

  const fundToExchange = (exchange, amount) => {
    
    let newExchanges = [...exchanges];
    let exchangeToReceive = newExchanges.find(ex => ex.title.toUpperCase() === exchange.toUpperCase());
    let amountToReceive = amount - exchangeToReceive.balance;
    let exchangeWithBalanceMoreThanMin = newExchanges.filter(ex => ex.title.toUpperCase() !== exchange.toUpperCase() && amount <= (ex.balance - min));
    if (exchangeWithBalanceMoreThanMin?.length > 0) {
      let exchangeToWithdraw = exchangeWithBalanceMoreThanMin[0];
      let amountToWithdraw = exchangeToWithdraw.balance - min;
      exchangeToWithdraw.balance -= amountToWithdraw;
      exchangeToReceive.balance += amountToReceive;
      setTrxs([...trxs, {
        balancing: new Date().toLocaleString() + ' - Fondeo para transaccionar',
        from: exchangeToWithdraw.title,
        to: exchangeToReceive.title,
        amount: amountToReceive
      }])
    } else {
      let hasExchageWithBalaceToWithdraw = newExchanges.filter(ex => ex.title.toUpperCase() !== exchange.toUpperCase() && ex.balance >= amount);
      if (hasExchageWithBalaceToWithdraw?.length > 0) {
        var tmp = newExchanges.map(function (o) {
          return o.balance;
        });
        var maxValue = Math.max.apply(Math, tmp);
        tmp = tmp.map( (o) => o.toString());
        var index = tmp.indexOf(maxValue.toString());
        let exchangeToWithdraw = newExchanges[index];
        let amountToWithdraw = exchangeToWithdraw?.balance;
        exchangeToWithdraw.balance -= amountToWithdraw;
        exchangeToReceive.balance += amountToReceive;
        setTrxs([...trxs, {
          balancing: new Date().toLocaleString() + ' - Fondeo para transaccionar',
          from: exchangeToWithdraw.title,
          to: exchangeToReceive.title,
          amount: amountToReceive
        }])
      } else {
        let tmpTrxs = [...trxs]
        newExchanges.every((ex) => {
          if (ex.title.toUpperCase() !== exchange.toUpperCase()) {
            let amountToExchange = amountToReceive;
            if(ex.balance <= amountToReceive) {
              amountToExchange = ex.balance;
            }
            amountToReceive -= amountToExchange;
            ex.balance -= amountToExchange;
            exchangeToReceive.balance += amountToExchange;
            tmpTrxs.push({
              balancing: new Date().toLocaleString() + ' - Fondeo para transaccionar',
              from: ex.title,
              to: exchangeToReceive.title,
              amount: amountToExchange
            })
            if (exchangeToReceive.balance >= amount) {
              return false
            }
            return true;
          }
          return true;
        });
        setTrxs(tmpTrxs)
      }
    }
    return newExchanges;
  }

  const validateExchangeNeedBalancing = (newExchangesParam) => {
    let newExchanges = [...exchanges];
    if(newExchangesParam) { newExchanges = newExchangesParam }
    let exchangesToBalance = newExchanges.filter(ex => ex.balance < min);
    if (exchangesToBalance.length > 0) {
      return true;
    }
    return false;
  }

  const balance = (newExchangesParam) => {
    let newExchanges = [...exchanges];
    if(newExchangesParam) { newExchanges = newExchangesParam }

    let exchangesToBalance = newExchanges.filter(ex => ex.balance < min);
    let tempTrxs = [...trxs];
    exchangesToBalance.forEach(exchange => {
      let exchangesToReceive = newExchanges.filter(ex => ex.balance > average);
      exchangesToReceive.forEach(exchangeToReceive => {
        let amount = Math.min(exchangeToReceive.balance - average, min - exchange.balance);
        console.log("amount", amount)
        if (amount > 0) {
          exchange.balance += amount;
          exchangeToReceive.balance -= amount;
          tempTrxs.push({
            balancing: new Date().toLocaleString() + ' - Balanceo',
            from: exchangeToReceive.title,
            to: exchange.title,
            amount: amount
          })
        }
      })
    })
    setTrxs(tempTrxs);
    setExchanges(newExchanges);
  }

  const compra = (exchange, amount) => {
    if(!exchange || !amount) return;
    const canBuy = validateBalanceToBuy(amount);
    if (!canBuy) {
      alert('No hay fondos para la transacción')
      return;
    }
    const exchangeNeedBalance = validateExchageNeedBalance(exchange, amount);
    let newExchanges = [...exchanges];
    if (exchangeNeedBalance) {
      newExchanges = fundToExchange(exchange, amount);
    }
    newExchanges.find(ex => ex.title.toUpperCase() === exchange.toUpperCase()).balance -= amount;
    setExchanges(newExchanges);
    setBuyForm({
      exchange: '',
      amount: 0
    })    
  }

  useEffect(() => {
    calcAverage();
  }, [])
  useEffect(() => {
    if (validateExchangeNeedBalancing()) {
      balance();
    }
    calcAverage();
  }, [exchanges, critical, minPercent])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Balanceador Towerbank
        </p>
      </header>
      <div className="container">
        <div className="form-transactions">
          <p><strong>Parametros</strong></p>
          <div className="form-group">
            <label htmlFor="percent">Porcentaje para balanceo (%)</label>
            <input
              type="number"
              id="percent"
              value={minPercent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="critical">Critico (monto USDT)</label>
            <input
              type="number"
              id="critical"
              value={critical}
              onChange={(e) => setCritical(e.target.value)}
            />
          </div>
          <div className="divider" />
          <p><strong>Transaccion</strong></p>
          <div className="form-group">
            <label htmlFor="exchange">Exchange</label>
            <select
              id="exchange"
              value={buyForm.exchange}
              onChange={(e) => setBuyForm({ ...buyForm, exchange: e.target.value })}
            >
              <option value="">Seleccione</option>
              {
                exchanges.map((exchange, index) => (
                  <option key={index} value={exchange.title}>{exchange.title}</option>
                ))
              }
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="amount">Monto</label>
            <input
              type="number"
              id="amount"
              value={buyForm.amount}
              onChange={(e) => setBuyForm({ ...buyForm, amount: e.target.value })}
            />
          </div>
          <div className="form-group">
            <input
              type="button"
              value="Comprar"
              onClick={() => {
                compra(buyForm.exchange, parseInt(buyForm.amount));
              }}
            />
          </div>
        </div>
        <div className="exchanges-container">
          {
            exchanges.map((exchange, index) => (
              <ExchangeBar
                key={index}
                {...exchange}
                min={min}
                max={max}
                average={average}
                critical={critical}
                setBalance={(balance) => {
                  let newExchanges = [...exchanges];
                  newExchanges[index].balance = balance;
                  setExchanges(newExchanges);
                }}
              />))
          }
        </div>

      </div>
      <div className="balanceos-container">
        <p><strong>Balanceos</strong></p>
        <Tabla data={trxs} />
      </div>
    </div>
  );
}

export default App;
