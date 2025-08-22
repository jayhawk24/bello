import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUser() {
    try {
        // Hash the password (you'll need to set your actual password)
        const password = 'your-password-here'; // Replace with your actual password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the user first
        const user = await prisma.user.create({
            data: {
                id: 'cmefq0zm00000lb04gk0f3bcb', // Use the same ID from session
                email: 'airbnbvandana@gmail.com',
                name: 'Ashish Gupta',
                role: 'hotel_admin',
                password: hashedPassword,
            }
        });

        console.log('Created user:', user.email);

        // Create the hotel
        const hotel = await prisma.hotel.create({
            data: {
                id: 'cmefq10080002lb04fnqbg2be', // Use the same ID from session
                name: 'Vandana Guest House',
                address: '',
                city: '',
                state: '',
                country: '',
                contactEmail: 'airbnbvandana@gmail.com',
                contactPhone: '+919453106183',
                adminId: 'cmefq0zm00000lb04gk0f3bcb', // Link to the user
                subscriptionPlan: 'basic',
                subscriptionStatus: 'inactive',
                totalRooms: 0,
            }
        });

        console.log('Created hotel:', hotel.name);

        console.log('✅ User and hotel seeded successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedUser();
