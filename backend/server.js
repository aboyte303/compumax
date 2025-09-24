const express = require('express');
const cors = require('cors');

//rutas de autenticacion
const authRoutes = require('./routes/auth');
const auth = require('./middlewares/auth');


//rutas de back
const clientesRoutes = require('./routes/clientes');
const sucursalesRoutes = require('./routes/sucursales');
const serviciosRoutes = require('./routes/servicios');
const radiosAntenasRoutes = require('./routes/radiosAntenas');
const routerSwitchRoutes = require('./routes/routerswitch');
const camarasipRoutes = require("./routes/camarasip");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/clientes',auth, clientesRoutes);
app.use('/api/sucursales',auth, sucursalesRoutes);
app.use('/api/servicios',auth, serviciosRoutes);
app.use('/api/radios_antenas',auth, radiosAntenasRoutes);
app.use('/api/routerswitch',auth, routerSwitchRoutes);
app.use("/api/camarasip",auth, camarasipRoutes);
app.use("/api/dashboard",auth, dashboardRoutes);
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
    