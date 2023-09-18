import React from 'react';
import styles from './App.module.css';
import {PlayersScreen} from "./ui/screens";

function App() {
  return (
    <div className={styles.corpoApp}>
      <PlayersScreen/>
    </div>
  );
}

export default App;
