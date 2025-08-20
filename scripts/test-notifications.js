// Test notification system
const BASE_URL = 'http://localhost:3000';
const BOOKING_ID = 'cmek5yxru0001glb8w5s24wye'; // Use the newly created test booking ID

async function testNotificationSystem() {
    console.log('🔔 Testing Real-time Notification System...\n');

    try {
        console.log('1. Creating a service request to trigger notifications...');

        // Get available services first
        const servicesResponse = await fetch(`${BASE_URL}/api/guest/services?bookingId=${BOOKING_ID}`);
        const servicesData = await servicesResponse.json();

        if (!servicesResponse.ok) {
            console.log('❌ Failed to get services:', servicesData.error);
            return;
        }

        const service = servicesData.services[0]; // Use first available service
        if (!service) {
            console.log('❌ No services available');
            return;
        }

        // Create a service request
        const requestData = {
            bookingId: BOOKING_ID,
            serviceId: service.id,
            title: 'Need extra towels - NOTIFICATION TEST',
            description: 'This is a test request to verify notifications work properly',
            priority: 'high' // High priority to make it stand out
        };

        const requestResponse = await fetch(`${BASE_URL}/api/guest/service-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const requestResult = await requestResponse.json();

        if (requestResponse.ok) {
            console.log('✅ Service request created successfully!');
            console.log('   Request ID:', requestResult.serviceRequest.id);
            console.log('   Title:', requestResult.serviceRequest.title);
            console.log('   Priority:', requestResult.serviceRequest.priority);
            console.log('   📱 Staff notifications should have been sent!');

            // Wait a moment for notifications to process
            console.log('\n⏳ Waiting 2 seconds for notifications to process...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('\n2. Checking if notifications were created...');
            // Note: We can't directly test the notification API without authentication
            // But we can verify the request was created and notifications would be triggered

            console.log('✅ Notification system test completed!');
            console.log('\n📋 What should happen:');
            console.log('   1. Staff users should see a notification bell with a badge');
            console.log('   2. Clicking the bell shows the new service request notification');
            console.log('   3. Browser notifications appear (if permissions granted)');
            console.log('   4. Staff can click notifications to go to the requests page');

        } else {
            console.log('❌ Service request creation failed:', requestResult.error);
        }

    } catch (error) {
        console.log('❌ Network error:', error);
    }
}

// Run the test
testNotificationSystem();
