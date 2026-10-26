import React from 'react';
import { registerRootComponent } from 'expo';
import { AutoUpdateGate } from './src/AutoUpdate';
import App from './App';

function Root() {
  return (
    <AutoUpdateGate>
      <App />
    </AutoUpdateGate>
  );
}

registerRootComponent(Root);
