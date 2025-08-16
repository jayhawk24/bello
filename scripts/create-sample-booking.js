const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleBooking() {
    try {
        // First, let's get an existing hotel and room
        const hotel = await prisma.hotel.findFirst({
            include: {
                rooms: true
            }
        });

        if (!hotel || !hotel.rooms.length) {
            console.log('No hotel or rooms found. Please create a hotel and rooms first.');
            return;
        }

        const room = hotel.rooms[0];

        // Create a sample booking
        const booking = await prisma.booking.create({
            data: {
                hotelId: hotel.id,
                roomId: room.id,
                bookingReference: 'BK' + Date.now().toString().slice(-6),
                checkInDate: new Date(),
                checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                guestName: 'John Doe',
                guestEmail: 'john.doe@example.com',
                guestPhone: '+1234567890',
                status: 'checked_in'
            }
        });

        console.log('Sample booking created:');
        console.log(`Booking ID: ${booking.id}`);
        console.log(`Booking Reference: ${booking.bookingReference}`);
        console.log(`Hotel: ${hotel.name}`);
        console.log(`Room: ${room.roomNumber}`);
        console.log(`Guest: ${booking.guestName}`);
        console.log(`Check-in: ${booking.checkInDate}`);
        console.log(`Check-out: ${booking.checkOutDate}`);
        
        console.log('\nYou can test the booking ID access at:');
        console.log(`http://localhost:3001/guest/booking-id`);
        console.log(`Use booking reference: ${booking.bookingReference}`);

    } catch (error) {
        console.error('Error creating sample booking:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSampleBooking();
