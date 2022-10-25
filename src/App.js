import './App.css';
import { useEffect, useReducer } from 'react';
import axios from 'axios';

function reducer(state, action) {
  switch (action.type) {

    case 'ADD_JOKE':
      return {
        ...state,
        jokes: state.jokes.concat({ value: action.payload.value, id: action.payload.id })
      }

    case 'GET_NEW_JOKE':
      return { ...state, getNewJoke: true }

    case 'GET_JOKES_AUTOMATICALLY':
      return { ...state, getAuto: true }

    case 'GET_JOKES_MANUALLY':
      return { ...state, getAuto: false }

    case 'REQUEST_FINISHED':
      return { ...state, getNewJoke: false }

    case 'SAVE_INTERVAL_ID':
      return { ...state, intervalId: action.payload }

    default:
      throw new Error("Action.type unknown")
  }
}

function App() {

  const [data, dispatch] = useReducer(reducer, { jokes: [], getNewJoke: false, getAuto: false, intervalId: null });

  // new joke is fetched iff getNewJoke is true
  useEffect(() => {
    if (data.getNewJoke == true) {
      async function getJoke() {
        try {
          let result = await axios('https://api.chucknorris.io/jokes/random');
          dispatch({ type: 'REQUEST_FINISHED' })
          dispatch({ type: 'ADD_JOKE', payload: { value: result.data.value, id: result.data.id } })
        } catch {
          console.log("Failed to retrieve a joke")
        }
      }
      getJoke()
    }
  }, [data.getNewJoke])

  // jokes are fetched automatically every 10 seconds iff getAuto is true
  useEffect(() => {
    if (data.getAuto == false && data.intervalId !== null) {
      console.log(data.intervalId)
      clearInterval(data.intervalId)
    }
    if (data.getAuto == true) {
      dispatch({ type: 'GET_NEW_JOKE' })
      dispatch({
        type: 'SAVE_INTERVAL_ID',
        payload: setInterval(() => dispatch({ type: 'GET_NEW_JOKE' }), 10000)
      })
    }

  }, [data.getAuto])


  return (
    <div className="App">
      <div className='buttons'>
        {data.getAuto ? <button onClick={() => dispatch({ type: 'GET_JOKES_MANUALLY' })}>Hae vitsejä manuaalisesti</button>
          : <div>
            <button onClick={() => dispatch({ type: 'GET_NEW_JOKE' })}>Hae vitsi</button>
            <button onClick={() => dispatch({ type: 'GET_JOKES_AUTOMATICALLY' })}>Hae vitsejä automaattisesti</button>
          </div>}
      </div>
      <div key={Math.random()} className='jokeContainer'>
        {data.jokes.length > 0 && data.jokes[data.jokes.length - 1].value}
      </div>
    </div>

  );
}

export default App;
