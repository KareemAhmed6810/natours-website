// ANA HENA BSEEB EL MWADEE3 ELLY MLHASH 3LAKA B EL EXPRESS LIKE:DB CONFIGURATION,ERROR HANDLING,DATA ENVIROMENTAL VARIABLES

//ARROH EL PACKAGE.JSON WE A8YR EL START WE AKTB  "NODEMON SERVER.JS"
//lazm akhly dotenv f el awl
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

const app = require('./app');
// hy2oly esm el enovroment el fucntion de given by express
console.log(app.get('env'));
console.log('**********************');
//function is given by nodejs
// process modulse is everywhere no need to be required
// console.log(process.env);
mongoose
  .connect(process.env.DATABASE_LOCAL, {})
  .then(() => console.log('DB connection successful!!'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
