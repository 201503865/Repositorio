const fs = require('fs');
const directorio = '/proc/';
var os 	= require('os-utils');




module.exports = (app,passport) => {
    app.get('/login',(req,res)=>{
        res.render('index');
    });

    app.get('/home',(req,res)=>{
        Obtener_Datos();
        contadores.push(contador_detenidos);
        contadores.push(contador_ejecucion);
        contadores.push(contador_suspendidos);
        contadores.push(contador_zombie);
        contadores.push(contador_procesos);
        //console.log(contadores[3]);
        res.render('home',{info1:contadores,info2:procesos,name:"hola"});
    });

    app.post('/home',(req,res)=>{
        console.log(req.body.pid);
        // Vamos a requerir del modulo que provee Node.js 
        // llamado child_process
        var exec = require('child_process').exec, child;
        // Creamos la función y pasamos el string pwd 
        // que será nuestro comando a ejecutar
        child = exec('kill -TERM '+req.body.pid,
        // Pasamos los parámetros error, stdout la salida 
        // que mostrara el comando
        function (error, stdout, stderr) {
            // Imprimimos en pantalla con console.log
            console.log(stdout);
            // controlamos el error
            if (error !== null) {
            console.log('exec error: ' + error);
            }
        });
        res.redirect('/home');
    });

    app.get('/CPU',(req,res)=>{
        
        res.render('monitor1_vista2',{info1:uso_cpu});
    });

    app.post("/CPU", function (req, res) {

        res.send({info1:uso_cpu});
    });

    app.get('/RAM',(req,res)=>{
        var datos =[uso_memoria,memoria_total,memoria_porcentaje,memoria_consumida];
        res.render('monitor2_vista2',{info1:datos});
    });

    app.post("/RAM", function (req, res) {
        var datos =[uso_memoria,memoria_total,memoria_porcentaje,memoria_consumida];
        res.send({info1:datos});
    });

    app.post('/login',(req,res)=>{
        console.log(req.body.usuario);
        if(req.body.usuario=='admin'){
            res.redirect('/home');
        }else{
            res.render('index');
        }
    });
};



let archivos;
var procesos = new Array();
var proceso;
var contador_procesos;
var contador_ejecucion;
var contador_suspendidos;
var contador_detenidos;
var contador_zombie;
var directorio_usuario = '/etc/passwd';
var contadores = new Array();
var puntos_CPU =[];

for(var i = 0;i<60;i++){
    puntos_CPU.push([i,0]);
}

var uso_cpu;
var uso_memoria;
var memoria_total;
var memoria_consumida;
var memoria_porcentaje;

setInterval(function () {
    os.cpuUsage(function(v){
        var punto = Math.round(v * 100) / 100 ;
        //dato de cpu
        uso_cpu = punto;
    });
    //datos de memoria
    uso_memoria = os.totalmem()-os.freemem();
    memoria_consumida = Math.round(uso_memoria * 100) / 100;
    memoria_total =  Math.round(os.totalmem() * 100) / 100;
    memoria_porcentaje = Math.round(((uso_memoria*100)/memoria_total)*100)/100;
    console.log(memoria_total);
    //console.log(memoria);

}, 1000);

Obtener_Datos = function() {
    procesos = new Array();
    contadores = new Array();
    contador_procesos=0;
    contador_ejecucion=0;
    contador_suspendidos=0;
    contador_detenidos=0;
    contador_zombie=0;
    archivos = fs.readdirSync(directorio);
    for(var archivo in archivos){
        if(!isNaN(archivos[archivo])){
            var id = archivos[archivo];
            var directorio_proceso = directorio +id;
            var datos_proceso = fs.readFileSync(directorio_proceso+"/status");
            proceso = new Array();
            datos = datos_proceso.toString().split('\n');
            var estado = datos[1];
            var estado = estado.split('	')[1];
            var estado = estado.split(' ')[0];
            if(estado=="S"){
                contador_suspendidos++;
                estado = "Suspendido";
            }else if(estado == "R"){
                contador_ejecucion++;
                estado = "Ejecucion";
            }else if(estado=="T"){
                estado = "Detenido";
                contador_detenidos++;
            }else if(estado == "Z"){
                estado = "Zombie";
                contador_zombie++;
            }else if(estado == 'D'){
                estado = "Suspendido"
                contador_suspendidos++;
            }else if(estado == "I"){
                estado = "Zombie";
                contador_zombie++;
            }
            contador_procesos++;
            var usuario = datos[7];
            usuario = usuario.split('	')[1];
            var datos_usuarios = fs.readFileSync(directorio_usuario);
            var usuarios = datos_usuarios.toString().split('\n');
            for(var i =0;i<usuarios.length;i++){
                var usuario_datos = usuarios[i].split(':');
                if(usuario_datos[2]==usuario){
                    usuario = usuario_datos[0];
                }
            }
            var nombre_proceso = datos[0];
            nombre_proceso = nombre_proceso.split('	')[1];
            var datos_ram = fs.readFileSync(directorio_proceso+"/statm");
            var cantida_ram = datos_ram.toString().split(' ');
            cantida_ram=cantida_ram[0];
			var memtotal =  Math.round(os.totalmem() * 100) / 100;
			memtotal = memtotal/100;
            var porcentaje_ram = cantida_ram/memtotal;
            porcentaje_ram = Math.round(porcentaje_ram*100)/100;
            //console.log(id);
            //console.log(usuario);
            //console.log(estado);
            //console.log(nombre_proceso);
            porcentaje_ram = porcentaje_ram +"%";
            //console.log(porcentaje_ram);
            proceso.push(id);
            proceso.push(usuario);
            proceso.push(estado);
            proceso.push(porcentaje_ram);
            proceso.push(nombre_proceso);
            procesos.push(proceso);
        }
    }
}