if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const hbshelpers = require('handlebars-helpers')
const multihelpers = hbshelpers()
const helpers = require('./_helpers')
const express = require('express')
const handlebars = require('express-handlebars')
const db = require('./models')
const app = express()
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const port = process.env.PORT || 3000

app.engine('handlebars', handlebars({
  defaultLayout: 'main', 
  helpers: require('./config/handlebars-helpers'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
},))
app.set('view engine', 'handlebars')
app.use(express.urlencoded({ extended:true }))
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  next()
})


app.listen(port, () => {
  db.sequelize.sync()
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app, passport)

module.exports = app
