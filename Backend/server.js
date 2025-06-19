require('dotenv').config()
const app = require('./src/app');

app.listen(4001, () => {
  console.log('Server is running on port 4001');
});