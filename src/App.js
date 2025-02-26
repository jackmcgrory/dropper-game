import React, {useState} from 'react';
import './App.css';
import PlinkoDropper from './PlinkoDropper';

function App() {
  const labelSet = [
    ['Investments', 'Budgeting', 'Protection','General Insurance', 'Building your Pension', 'Accessing your Pension']
  ];
  const [currentBucketList, setCurrentBucketList] = useState(labelSet[0])

  return (
    <div className="app-container">
     <PlinkoDropper labels={currentBucketList} cols={30} rows={20} ballSize={20} ballCount={1} />
    </div>
  );
}

export default App;
