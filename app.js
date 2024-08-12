const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const clientRoutes = require('./routes/client');
const demandeurRoutes = require('./routes/demandeur');
const homeRouter = require('./routes/home1');
const utilisateurRoutes = require('./routes/utilisateur');
const ticketRoutes = require('./routes/ticket');
const authRoutes = require('./routes/auth');

const app = express();
const port = 4000;



app.use(bodyParser.json());


app.use(express.urlencoded({ extended: true }));



app.use(bodyParser.urlencoded({ extended: true }));//trueeeeeeeeeeee
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');

app.use(methodOverride('_method'));

app.use('/plugins', express.static(__dirname + '/node_modules/admin-lte/plugins'));
app.use('/dist', express.static(__dirname + '/node_modules/admin-lte/dist'));



app.use('/clients', clientRoutes);
app.use('/home1', homeRouter);
app.use('/demandeurs',demandeurRoutes);
app.use('/utilisateurs', utilisateurRoutes);
app.use('/tickets',ticketRoutes);
app.use('/' , authRoutes);



app.use("/assets" , express.static("assets"));






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
