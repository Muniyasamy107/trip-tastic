import {db} from '../server/api.mjs';
import {createAdminAccount} from '../server/admin.mjs';
const args=process.argv.slice(2),index=args.indexOf('--username');
try{
 const account=createAdminAccount(db,{username:index>=0?args[index+1]:'superadmin',reset:args.includes('--reset')});
 console.log(`\nSUPER ADMIN — PRIVATE OWNER CREDENTIALS\n\nUsername: ${account.username}\nPassword: ${account.password}\n\nSign in at /admin.html. Store this password in your password manager.\nIt is shown once here, never included in frontend code or saved as plaintext.\nReset command: npm run admin:setup -- --reset\nA reset revokes every existing admin session.\n`);
}catch(error){console.error(error.message);process.exitCode=1;}finally{db.close();}
