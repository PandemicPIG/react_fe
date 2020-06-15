import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom"
import Page from './components/page'

function App() {
  return (
    <div className="App">
    <Router>
      <Switch>
        <Route path="/:page" children={<Page />} />
        <Route exact path="/">
          <Redirect to="/1" />
        </Route>
      </Switch>
    </Router>
  </div>
  );
}

export default App
