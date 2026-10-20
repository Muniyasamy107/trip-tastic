// Owner-only command. This is intentionally NOT exposed as a public API.
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
const file=path.resolve(process.env.DATA_DIR||'.data','enquiries.sqlite');
if(!fs.existsSync(file)){console.log('No enquiries database yet. Start the website first.');process.exit(0);}
const db=new DatabaseSync(file,{readOnly:true});
const rows=db.prepare('SELECT id,created_at,name,email,phone,destination,travel_date,travellers,budget,pace,notes FROM enquiries ORDER BY created_at DESC LIMIT 100').all();
if(process.argv.includes('--json'))console.log(JSON.stringify(rows,null,2));
else{console.log('PRIVATE: Latest 100 journey enquiries. Do not publish this output.');console.table(rows.map(({id,created_at,name,email,destination,travel_date,travellers})=>({reference:id,received:created_at,name,email,journey:destination,date:travel_date,travellers})));console.log('Use npm run enquiries -- --json for full enquiry details.');}
db.close();
