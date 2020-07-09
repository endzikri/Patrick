import React, {Component} from 'react';
import axios from 'axios'
import './App.css';

class App extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data:[]
    }
  }
  async componentDidMount() {
    let players = await axios.post('/players');
    this.setState({
      data: players.data
    })
  }

  render() {
    return (
        <div className="App">
          <table>
            <tbody>
            <tr><th>ID</th><th>SCORE</th></tr>
            {this.state.data.map((e, i) => {
              return (
                  <tr key={i}><td>{e['_id']}</td><td>{e['result']}</td></tr>
              );
            })}
            </tbody>
          </table>
        </div>
    );
  }


}

export default App;
