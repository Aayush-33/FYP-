import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if the admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: 'karkiaayush901@gmail.com',
      },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      // Update admin status if needed
      if (!existingAdmin.isAdmin) {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { isAdmin: true },
        });
        console.log('Updated existing user to admin status');
      }
    } else {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Aayush11@', salt);

      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: {
          username: 'Aayush Karki',
          email: 'karkiaayush901@gmail.com',
          password: hashedPassword,
          isAdmin: true,
        },
      });
      console.log('Admin user created successfully:', newAdmin.username);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 