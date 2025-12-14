const bcrypt=require('bcrypt');
const db=require('./src/db');
(async()=>{
  try{
    const h=await bcrypt.hash('Client123',10);
    const res = await db.query('INSERT INTO users (username,password,full_name,role,kelompok_id) VALUES ($1,$2,$3,$4,$5) RETURNING id,username,role',['client',h,'Client User','client',null]);
    console.log('CREATED:', res.rows);
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
})();
