import './App.css';
import { useEffect, useReducer } from 'react';
import axios from 'axios';

function reducer(state, action) {
  switch (action.type) {

    case 'GET_NEW_JOKE':
      return { ...state, getNewJoke: true };

    case 'UPDATE_DATA':
      return {
        ...state,
        jokes: state.jokes.concat(action.payload.joke),
        getNewJoke: false,
        requestFailed: action.payload.failed
      };

    case 'GET_JOKES_AUTOMATICALLY':
      return { ...state, getAuto: action.payload };

    case 'SAVE_INTERVAL_ID':
      return { ...state, intervalId: action.payload };

    default:
      throw new Error("Action.type unknown");
  }
}

function App() {

  const [data, dispatch] = useReducer(reducer, { jokes: [], getNewJoke: false, requestFailed: false, getAuto: false, intervalId: null });

  function getRandomInt(upperBound) {
    return Math.floor(Math.random() * upperBound);
  }

  // new joke is fetched iff getNewJoke changed to true
  useEffect(() => {
    if (data.getNewJoke === true) {
      async function getJoke() {
        try {
          let result = await axios('https://api.chucknorris.io/jokes/random');
          let newJoke = { value: result.data.value, id: result.data.id };
          dispatch({ type: 'UPDATE_DATA', payload: {joke: newJoke, failed: false }});

          // save joke to local storage
          let jokesData = JSON.parse(localStorage.getItem('jokesData'));
          console.log("jokesdata",jokesData)
          if (jokesData == null) {
            jokesData = [];
          }
          if (!jokesData.find(joke => joke.id == newJoke.id)) {
            jokesData.push(newJoke);
            localStorage.setItem('jokesData', JSON.stringify(jokesData));
          }
        } catch (error) {
          console.log(error.name, "Failed to retrieve a joke from api", );
          // get joke from local storage instead
          let jokesData = JSON.parse(localStorage.getItem('jokesData'));
          if (jokesData !== null) {
            dispatch({ type: 'UPDATE_DATA', payload: {joke: jokesData[getRandomInt(jokesData.length)], failed: true }});
          }
        }
      }
      getJoke();
    }
  }, [data.getNewJoke]);

  /* jokes are fetched automatically every 10 seconds iff getAuto changed to true and
  interval is removed iff getAuto changed to false */
  useEffect(() => {
    if (data.getAuto == false && data.intervalId !== null) {
      clearInterval(data.intervalId);
    }
    if (data.getAuto == true) {
      dispatch({ type: 'GET_NEW_JOKE' });
      dispatch({
        type: 'SAVE_INTERVAL_ID',
        payload: setInterval(() => dispatch({ type: 'GET_NEW_JOKE' }), 10000)
      })
    }
  }, [data.getAuto]);


  return (
    <div className="App">
      <div className="buttons">
        {data.getAuto ? <button onClick={() => dispatch({ type: 'GET_JOKES_AUTOMATICALLY', payload: false })}>Hae vitsejä manuaalisesti</button> :
          <div>
            <button onClick={() => dispatch({ type: 'GET_NEW_JOKE' })}>Hae vitsi</button>
            <button onClick={() => dispatch({ type: 'GET_JOKES_AUTOMATICALLY', payload: true })}>Hae vitsejä automaattisesti</button>
          </div>}
      </div>
      {/* following div needs to have a changing key for animation to start over on render */}
      <div key={Math.random()} className='jokeContainer'>
        {data.jokes.length > 0 && data.jokes[data.jokes.length - 1].value}
      </div>
      {data.requestFailed && <div className="info">Getting jokes from localStorage...</div>}
    </div>
  );
}

export default App;

