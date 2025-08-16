const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestGuest() {
    try {
        // Hash a simple password
        const hashedPassword = await bcrypt.hash('password123', 12);

        // Create test guest user
        const guest = await prisma.user.create({
            data: {
                email: 'guest@example.com',
                name: 'Test Guest',
                role: 'guest',
                password: hashedPassword,
                hotelId: 'hotel_golden_1701' // Use the existing hotel ID
            }
        });

        console.log('✅ Test guest user created:');
        console.log('Email: guest@example.com');
        console.log('Password: password123');
        console.log('Guest ID:', guest.id);

    } catch (error) {
        console.error('Error creating test guest:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestGuest();
