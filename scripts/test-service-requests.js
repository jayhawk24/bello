// Test script to verify service request functionality
// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000';
const BOOKING_ID = 'cmed61oci0001gli9ha2p6fqc'; // BK779009 - Sample booking we created

async function testServiceRequests() {
    console.log('🧪 Testing Service Request System...\n');

    try {
        // Test 1: Get services for a booking
        console.log('1. Testing GET /api/guest/services...');
        const servicesResponse = await fetch(`${BASE_URL}/api/guest/services?bookingId=${BOOKING_ID}`);
        const servicesData = await servicesResponse.json();
        
        if (servicesResponse.ok) {
            console.log('✓ Services API working');
            console.log(`   Found ${servicesData.services.length} services`);
            servicesData.services.forEach((service, i) => {
                console.log(`   ${i + 1}. ${service.icon} ${service.name} (${service.id})`);
            });
        } else {
            console.log('❌ Services API failed:', servicesData.error);
            return;
        }

        // Test 2: Create a service request
        console.log('\n2. Testing POST /api/guest/service-requests...');
        const firstService = servicesData.services[0];
        
        const requestResponse = await fetch(`${BASE_URL}/api/guest/service-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bookingId: BOOKING_ID,
                serviceId: firstService.id,
                title: 'Test Service Request',
                description: 'This is a test request from the test script',
                priority: 'medium'
            })
        });
        
        const requestData = await requestResponse.json();
        
        if (requestResponse.ok) {
            console.log('✓ Service request creation working');
            console.log(`   Created request: ${requestData.serviceRequest.title}`);
            console.log(`   Status: ${requestData.serviceRequest.status}`);
            console.log(`   Priority: ${requestData.serviceRequest.priority}`);
        } else {
            console.log('❌ Service request creation failed:', requestData.error);
        }

        // Test 3: Get service requests for booking
        console.log('\n3. Testing GET /api/guest/service-requests...');
        const getRequestsResponse = await fetch(`${BASE_URL}/api/guest/service-requests?bookingId=${BOOKING_ID}`);
        const getRequestsData = await getRequestsResponse.json();
        
        if (getRequestsResponse.ok) {
            console.log('✓ Get service requests working');
            console.log(`   Found ${getRequestsData.serviceRequests.length} requests for this booking`);
            getRequestsData.serviceRequests.forEach((request, i) => {
                console.log(`   ${i + 1}. ${request.title} - ${request.status} (${request.priority})`);
            });
        } else {
            console.log('❌ Get service requests failed:', getRequestsData.error);
        }

        console.log('\n🎉 Service Request System Test Complete!');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

testServiceRequests();
