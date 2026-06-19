const tls = require("tls");

const socket = tls.connect({
 host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
 port: 5432,
 rejectUnauthorized: false
}, () => {

 console.log("CONNECTED");
 console.log(socket.getProtocol());

 socket.end();

});

socket.on("error", e => {
 console.error(e);
});
