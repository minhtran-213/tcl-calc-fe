import React, { useState } from 'react';

interface CalculationResult {
  entryQuantity: number;
  entryProfit: number;
  limit1Quantity: number;
  limit1NewTP: number;
  limit1Profit: number;
  limit2Quantity: number;
  limit2NewTP: number;
  limit2Profit: number;
  isGoodMargin: string;
  entry: string;
  tp: string;
  limit1: string;
  limit2: string;
  sl: string
}

interface TradeRecord {
  name: string;
  datetime: string;
  pnl: number;
  currencyPair: string;
}

const TradingCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    leverage: '',
    balance: '',
    currencyPair: '',
    position: 'LONG',
    highPoint: '',
    lowPoint: '',
  });

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}`;
  };

  const applyToNotion = async () => {
    if (!result) return;

    const tradeRecord: TradeRecord = {
      name: `${inputs.currencyPair}_${formatDate(new Date())}`,
      datetime: new Date().toISOString(),
      pnl: result.entryProfit,
      currencyPair: inputs.currencyPair,
    };

    try {
      const response = await fetch('https://tcl-calc-be.onrender.com/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeRecord),
      });

      if (response.status === 201) {
        console.log("Successfully added trade to backend");
        alert("Trade successfully added to Notion!");
      } else {
        throw new Error('Failed to add trade');
      }
    } catch (error) {
      console.error("Error adding trade:", error);
      alert("Failed to add trade to Notion. Please try again.");
    }
  };

  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const calculateResults = () => {
    // Convert inputs to numbers
    const A = 4;
    const B = 7.4;
    const C = 40;

    const highPoint = parseFloat(inputs.highPoint);
    const lowPoint = parseFloat(inputs.lowPoint);
    const priceDiff = highPoint - lowPoint;
    const entry = inputs.position === 'LONG' ? lowPoint + priceDiff * 0.618 : highPoint - priceDiff * 0.618;
    const leverage = parseFloat(inputs.leverage);
    const balance = parseFloat(inputs.balance);
    const limit1 = inputs.position === 'LONG' ? lowPoint + priceDiff * 0.382 : highPoint - priceDiff * 0.382;
    const limit2 = inputs.position === 'LONG' ? lowPoint + priceDiff * 0.17 : highPoint - priceDiff * 0.17;
    const tp = inputs.position === 'LONG' ? lowPoint + priceDiff * 1.272 : highPoint - priceDiff * 1.272;
    const sl = inputs.position === 'LONG' ? lowPoint + priceDiff * -0.05 : highPoint - priceDiff * -0.05;

    const totalEntry = entry + limit1 * 3 + limit2 * 5;
    const A3 = totalEntry / 9;
    console.log('A3: ', A3);
    const riskFactor = A / C;
    const A6 =
      inputs.position === 'LONG'
        ? (balance * riskFactor) / (A3 - sl)
        : (balance * riskFactor) / (sl - A3);
    console.log('A6: ', A6);
    const A2 = (entry + limit1 * 3) / 4;
    const B6 = inputs.position === 'LONG' ? tp - entry : entry - tp;
    console.log("B6: ", B6);
    const A5 = (B6 / entry);
    console.log("A5: ", A5);
    const I13 = (A6 / 9) * 4;

    // Perform calculations (this is a placeholder, replace with actual calculation logic)
    const entryQuantity = A6 / 9;
    const marginPercentage = (A3 * A6) / (balance * leverage * 0.6);
    const entryProfit =
      inputs.position === 'LONG'
        ? tp * entryQuantity - entry * entryQuantity
        : entry * entryQuantity - tp * entryQuantity;
    const limit1Quantity = entryQuantity * 3; // Example: 30% of entry quantity
    const limit2Quantity = entryQuantity * 5; // Example: 50% of entry quantity
    const limit1NewTP = inputs.position === 'LONG' ? A2 + (A5 / A) * A2 : A2 - (A5 / A) * A2;
    const limit2NewTP = inputs.position === 'LONG' ? A3 + (A5 / B) * A3 : A2 - (A5 / B) * A3;
    const limit1Profit =
      inputs.position === 'LONG' ? limit1NewTP * I13 - A2 * I13 : A2 * I13 - limit1NewTP * I13;
    const limit2Profit =
      inputs.position === 'LONG' ? limit2NewTP * A6 - A3 * A6 : A3 * A6 - limit1NewTP * A6;

    setResult({
      entryQuantity,
      entryProfit,
      limit1Quantity,
      limit1NewTP: limit1NewTP,
      limit1Profit: limit1Profit,
      limit2Quantity,
      limit2NewTP: limit2NewTP,
      limit2Profit: limit2Profit,
      isGoodMargin: marginPercentage > 1 ? 'NO' : 'YES',
      entry: entry.toFixed(4),
      tp: tp.toFixed(4),
      limit1: limit1.toFixed(4),
      limit2: limit2.toFixed(4),
      sl: sl.toFixed(4),
    });
    console.log(result);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          name="highPoint"
          placeholder="High point"
          value={inputs.highPoint}
          onChange={handleInputChange}
          className="border p-2"
        />
        <input
          name="lowPoint"
          placeholder="Low point"
          value={inputs.lowPoint}
          onChange={handleInputChange}
          className="border p-2"
        />
        <input
          name="leverage"
          placeholder="Leverage"
          value={inputs.leverage}
          onChange={handleInputChange}
          className="border p-2"
        />
        <input
          name="balance"
          placeholder="Balance"
          value={inputs.balance}
          onChange={handleInputChange}
          className="border p-2"
        />
        <input
          name="currencyPair"
          placeholder="Currency Pair"
          value={inputs.currencyPair}
          onChange={handleInputChange}
          className="border p-2"
        />
        <select
          name="position"
          value={inputs.position}
          onChange={handleInputChange}
          className="border p-2"
        >
          <option value="LONG">LONG</option>
          <option value="SHORT">SHORT</option>
        </select>
      </div>
      <button onClick={calculateResults} className="bg-blue-500 text-white p-2 rounded">
        Calculate
      </button>

      {result && (
        <>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                    Account Size
                  </th>
                  <th
                    className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-right"
                    colSpan={2}
                  >
                    {inputs.balance}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className={inputs.position === 'LONG' ? 'bg-green-100' : 'bg-red-100'}>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                    {inputs.position}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {inputs.currencyPair}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-right">QTY</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">LIMIT</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{result.entry}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-right" rowSpan={2}>
                    {result.entryQuantity.toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">TP</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{result.tp}</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">SL</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{result.sl}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-right">
                    Margin Good
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                    Leverage
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{inputs.leverage}X</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-right">
                    {result.isGoodMargin}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                    Entry TP Amount
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    ${result.entryProfit.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-right">
                    {((result.entryProfit / parseFloat(inputs.balance)) * 100).toFixed(2)}%
                  </td>
                </tr>
              </tfoot>
            </table>
            <table className="min-w-full divide-y divide-gray-200 bg-gray-800 text-sm text-white">
              <thead>
                <tr>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-left">Add on</th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-right">Price</th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-right">Qty</th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-right">New TP</th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-right">TP Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="whitespace-nowrap px-4 py-2 font-medium">Limit 1</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">{result.limit1}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    {result.limit1Quantity.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    {result.limit1NewTP.toFixed(4)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    ${result.limit1Profit.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-2 font-medium">Limit 2</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">{result.limit2}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    {result.limit2Quantity.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    {result.limit2NewTP.toFixed(4)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    ${result.limit2Profit.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button onClick={applyToNotion} className="mt-4 bg-green-500 text-white p-2 rounded">
            Apply to Notion
          </button>
        </>
      )}
    </div>
  );
};

export default TradingCalculator;
