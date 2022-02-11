const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const db = require ('./config/db')
 require ('dotenv').config();
const cors = require('cors');
const authRouter = require ('./routes/auth');
const usersRouter = require('./routes/users');
 const productRouter =require ('./routes/product')
const categoryRouter = require('./routes/category');
const cartRouter = require('./routes/cart');
const addressRouter= require('./routes/address')

const app = express();


db.dbConnect(process.env.MDB_CONNECT);

app.use(cors({origin:["http://localhost:3000"]}))

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',authRouter);
app.use('/api/users', usersRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter)
app.use('/api/cart',cartRouter);
app.use('/api/address',addressRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;