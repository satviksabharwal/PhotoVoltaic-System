import { combineReducers } from 'redux';
import { userReducer } from './user/user.reducer';
// import { datasetReducer, deleteDatasetReducer } from './dataset/dataset.reducer';
// import { datasetListReducer } from './datasetList/datasetList.reducer';

export const rootReducer = combineReducers({
  user: userReducer,
  //   dataset: datasetReducer,
  //   list: datasetListReducer,
  //   deletedDataset: deleteDatasetReducer,
});
