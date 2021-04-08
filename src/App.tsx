import React from 'react';
import './App.css';

import {Loading} from './scenes';
import { Main } from './scenes';

function App() {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <div className="App">
      <header className="App-header">
        {!isLoaded ? <Loading onChange={setIsLoaded} isLoaded={isLoaded}/> : 
        <Main />}
      </header>
    </div>
  );
}

export default App;
