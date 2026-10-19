/**
 * CLI Script untuk mereset kata sandi Guru / Admin ALURIN.
 * Penggunaan: node scripts/reset-admin-password.js <username> <password_baru>
 * Contoh: node scripts/reset-admin-password.js guru rahasia123
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const username = args[0] || 'guru';
  const newPassword = args[1] || 'alurin2026';

  console.log(`==> Memproses reset password untuk user '${username}'...`);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const teacher = await prisma.teacher.upsert({
    where: { username },
    update: { password: hashedPassword },
    create: {
      username,
      password: hashedPassword,
      name: 'Guru Informatika ALURIN'
    }
  });

  console.log(`✅ Berhasil! Akun guru '${teacher.username}' siap digunakan.`);
  console.log(`🔑 Password baru: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal mereset password:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
