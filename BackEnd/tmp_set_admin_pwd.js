const bcrypt=require('bcrypt');
const db=require('./src/db');
(async()=>{
  try{
    const h=await bcrypt.hash('S3cret123',10);
    await db.query('UPDATE users SET password=$1 WHERE username=$2',[h,'admin']);
    const r=await db.query('SELECT id,username,full_name,role FROM users WHERE username=$1',['admin']);
    console.log('UPDATED:', JSON.stringify(r.rows,null,2));
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
})();
