import {
  createStore, applyMiddleware, compose, Reducer,
} from 'redux';
import thunk from 'redux-thunk';

const generateStore = (reducer: Reducer) => createStore(
  reducer,
  undefined,
  compose(applyMiddleware(thunk)),
);

export default generateStore;
