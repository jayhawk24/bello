const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
    try {
        console.log('🏨 Creating test data...');
        
        // Check if admin already exists
        let admin = await prisma.user.findUnique({
            where: { email: 'admin@testhotel.com' }
        });

        if (!admin) {
            // Create test hotel admin user
            const adminPassword = await bcrypt.hash('admin123', 12);
            admin = await prisma.user.create({
                data: {
                    email: 'admin@testhotel.com',
                    name: 'Hotel Admin',
                    role: 'hotel_admin',
                    password: adminPassword
                }
            });
            console.log('✅ Admin user created');
        } else {
            console.log('👤 Admin user already exists');
        }

        // Check if hotel already exists
        let hotel = await prisma.hotel.findFirst({
            where: { adminId: admin.id }
        });

        if (!hotel) {
            // Create test hotel
            hotel = await prisma.hotel.create({
                data: {
                    name: 'Golden Coast Hotel',
                    address: '123 Ocean Drive',
                    city: 'Miami',
                    state: 'FL',
                    country: 'USA',
                    contactEmail: 'info@goldencoasthotel.com',
                    contactPhone: '+1-305-555-0123',
                    adminId: admin.id,
                    subscriptionPlan: 'basic',
                    subscriptionStatus: 'active',
                    totalRooms: 10
                }
            });
            console.log('✅ Hotel created:', hotel.name);
        } else {
            console.log('🏨 Hotel already exists:', hotel.name);
        }
        
        // Update admin user with hotelId if needed
        if (!admin.hotelId) {
            await prisma.user.update({
                where: { id: admin.id },
                data: { hotelId: hotel.id }
            });
        }

        // Check if room already exists
        let room = await prisma.room.findFirst({
            where: { hotelId: hotel.id, roomNumber: '101' }
        });

        if (!room) {
            // Create test room
            room = await prisma.room.create({
                data: {
                    roomNumber: '101',
                    roomType: 'standard',
                    hotelId: hotel.id,
                    accessCode: 'DEMO123'
                }
            });
            console.log('✅ Room created:', room.roomNumber);
        } else {
            console.log('🏠 Room already exists:', room.roomNumber);
        }

        // Check if guest user already exists
        let guest = await prisma.user.findUnique({
            where: { email: 'guest@example.com' }
        });

        if (!guest) {
            // Create test guest user
            const guestPassword = await bcrypt.hash('guest123', 12);
            guest = await prisma.user.create({
                data: {
                    email: 'guest@example.com',
                    name: 'Test Guest',
                    role: 'guest',
                    password: guestPassword,
                    hotelId: hotel.id
                }
            });
            console.log('✅ Guest user created');
        } else {
            console.log('👤 Guest user already exists');
        }

        console.log('\n🎉 Test data ready!');
        console.log('  Admin - Email: admin@testhotel.com, Password: admin123');
        console.log('  Guest - Email: guest@example.com, Password: guest123');
        console.log('  Hotel ID:', hotel.id);
        console.log('  Room Code: DEMO123');

    } catch (error) {
        console.error('Error creating test data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestData();
