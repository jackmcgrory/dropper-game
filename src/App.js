import React, {useState} from 'react';
import './App.css';
import PlinkoDropper from './PlinkoDropper';

function App() {
  const labelSet = [
    ['Insurance', 'Pensions', 'Investments','Stocks and Shares', 'Cryptocurrency', 'Annutity'],
    ['Small Kids', 'Teenagers', 'Young Adults'],
  ];
  const [currentBucketList, setCurrentBucketList] = useState(labelSet[0])

  const updateBuckets = (event) => {
    const selectedIndex = event.target.value;
    setCurrentBucketList(labelSet[selectedIndex]);
  }

  return (
    <div className="app-container">
     <PlinkoDropper labels={currentBucketList} cols={30} rows={20} ballSize={20} ballCount={1} />

      <select onChange={updateBuckets} className="dropdown">
          {labelSet.map((labels, index) => (
            <option key={index} value={index}>
              {(index === 0) ? 'Category' : 'Age Group'}
            </option>
          ))}
        </select>
    </div>
  );
}

export default App;