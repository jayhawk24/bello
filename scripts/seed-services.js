const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedServices() {
    try {
        console.log('🌱 Seeding default services...');

        // Get the first hotel ID for services
        const hotel = await prisma.hotel.findFirst();
        
        if (!hotel) {
            console.error('❌ No hotel found in database');
            process.exit(1);
        }

        console.log(`✓ Using hotel: ${hotel.name} (${hotel.id})`);

        // Check if services already exist
        const existingServices = await prisma.service.count();
        
        if (existingServices > 0) {
            console.log(`✓ Services already exist (${existingServices} services found)`);
            return;
        }

        // Create default services
        const services = [
            {
                name: 'Room Service',
                description: 'Order food and beverages directly to your room',
                category: 'room_service',
                icon: '🍽️',
                hotelId: hotel.id
            },
            {
                name: 'Housekeeping',
                description: 'Request cleaning, towels, or other amenities',
                category: 'housekeeping',
                icon: '🧹',
                hotelId: hotel.id
            },
            {
                name: 'Concierge Service',
                description: 'Local recommendations and assistance',
                category: 'concierge',
                icon: '🎩',
                hotelId: hotel.id
            },
            {
                name: 'Maintenance',
                description: 'Report issues or request repairs',
                category: 'maintenance',
                icon: '🔧',
                hotelId: hotel.id
            },
            {
                name: 'Transportation',
                description: 'Taxi, shuttle, or car rental assistance',
                category: 'transportation',
                icon: '🚗',
                hotelId: hotel.id
            }
        ];

        // Create each service
        for (const serviceData of services) {
            const service = await prisma.service.create({
                data: serviceData
            });
            console.log(`✓ Created service: ${service.name} (${service.id})`);
        }

        console.log('🎉 Successfully seeded default services!');

        // Display the services
        const allServices = await prisma.service.findMany({
            include: {
                hotel: {
                    select: {
                        name: true
                    }
                }
            }
        });

        console.log('\n📋 Available Services:');
        allServices.forEach(service => {
            console.log(`   ${service.icon} ${service.name} (${service.category}) - ${service.hotel.name}`);
        });

    } catch (error) {
        console.error('❌ Error seeding services:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedServices();
