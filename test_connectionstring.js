const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

(async()=>{

  try{

    await client.connect();

    console.log("CONNECTED");

    const r = await client.query("SELECT NOW()");

    console.table(r.rows);

  }catch(e){

    console.error(e);

  }finally{

    await client.end().catch(()=>{});

  }

})();
