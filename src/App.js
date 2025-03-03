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


  {/* <select onChange={updateBuckets} className="dropdown">
      {labelSet.map((labels, index) => (
        <option key={index} value={index}>
          {(index === 0) ? 'Category' : 'Age Group'}
        </option>
      ))}
    </select> */}
</div>
);
}

export default App;
