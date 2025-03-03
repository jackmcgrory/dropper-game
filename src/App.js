import React, {useState} from 'react';
import './App.css';
import PlinkoDropper from './PlinkoDropper';

function App() {
  const labelSet = [
    ['Investments', 'Budgeting', 'Protection','General Insurance', 'Building your Pension', 'Accessing your pension']
  ];
  const [currentBucketList, setCurrentBucketList] = useState(labelSet[0])

  const updateBuckets = (event) => {
    const selectedIndex = event.target.value;
    setCurrentBucketList(labelSet[selectedIndex]);
  }

  return (
    <div className="app-container">
     <PlinkoDropper labels={currentBucketList} cols={30} rows={20} ballSize={15} ballCount={1} />
    </div>
  );
}

export default App;

