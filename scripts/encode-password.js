// Script para codificar senha do banco para URL
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Digite a senha do banco: ', (password) => {
  const encoded = encodeURIComponent(password);
  console.log('\nSenha codificada:', encoded);
  console.log('\nUse no DATABASE_URL assim:');
  console.log(`postgresql://postgres:${encoded}@db.kcelewgxwcdsbnvkhwjw.supabase.co:5432/postgres`);
  rl.close();
});


