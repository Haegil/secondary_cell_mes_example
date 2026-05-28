import { configureStore } from '@reduxjs/toolkit';
import mesReducer from './slices/mesSlice';

export const store = configureStore({
  reducer: {
    mes: mesReducer
  }
});

export default store;
