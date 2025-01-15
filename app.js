var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const config = require('./config'); // Importando o arquivo de configurações

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var conteudoRouter = require('./routes/conteudo');
var sobreRouter = require('./routes/sobre');
var quizRouter = require('./routes/quiz')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/conteudo', conteudoRouter);
app.use('/sobre', sobreRouter);
app.use('/quiz', quizRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Conexão com MongoDB
mongoose
  .connect(config.mongoURI)
  .then(() => console.log('Conexão com MongoDB Atlas bem-sucedida!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));


  // Middleware para log de acessos ao quiz (opcional)
app.use('/quiz', (req, res, next) => {
  console.log(`Acesso ao quiz em ${new Date().toISOString()}`);
  next();
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
