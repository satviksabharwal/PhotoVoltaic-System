const mongoose = require('mongoose');

module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect(process.env.DB, connectionParams).then(() => {
      console.log('Connection to database successful');
    });
  } catch (error) {
    console.log('Connection to database unsuccessful. ', error);
  }
};
