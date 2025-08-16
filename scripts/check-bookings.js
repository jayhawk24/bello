const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBookings() {
    try {
        console.log('📋 Checking existing bookings...\n');

        const bookings = await prisma.booking.findMany({
            include: {
                room: {
                    include: {
                        hotel: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (bookings.length === 0) {
            console.log('❌ No bookings found in database');
        } else {
            console.log(`✓ Found ${bookings.length} bookings:`);
            bookings.forEach((booking, i) => {
                console.log(`${i + 1}. ${booking.bookingReference} (ID: ${booking.id})`);
                console.log(`   Guest: ${booking.guestName} (${booking.guestEmail})`);
                console.log(`   Hotel: ${booking.room.hotel.name}`);
                console.log(`   Room: ${booking.room.roomNumber}`);
                console.log(`   Status: ${booking.status}`);
                console.log(`   Check-in: ${booking.checkInDate}`);
                console.log(`   Check-out: ${booking.checkOutDate}`);
                console.log();
            });
        }

    } catch (error) {
        console.error('❌ Error checking bookings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkBookings();
