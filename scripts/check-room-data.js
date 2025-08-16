const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRoomData() {
    try {
        console.log('🔍 Checking room and booking data...\n');

        const rooms = await prisma.room.findMany({
            include: {
                hotel: {
                    select: { name: true }
                }
            }
        });

        console.log(`Found ${rooms.length} rooms:`);
        rooms.forEach((room, i) => {
            console.log(`${i + 1}. Room ${room.roomNumber} at ${room.hotel.name}`);
            console.log(`   ID: ${room.id}`);
            console.log(`   Type: ${room.roomType}`);
            console.log(`   Access Code: ${room.accessCode || 'None'}`);
            console.log();
        });

        if (rooms.length > 0) {
            const bookings = await prisma.booking.findMany({
                where: {
                    roomId: rooms[0].id
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            console.log(`Bookings for Room ${rooms[0].roomNumber}:`);
            bookings.forEach((booking, i) => {
                console.log(`${i + 1}. ${booking.bookingReference} - ${booking.guestName}`);
                console.log(`   Status: ${booking.status}`);
                console.log(`   Booking ID: ${booking.id}`);
                console.log();
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRoomData();
