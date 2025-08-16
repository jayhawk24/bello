// Test room-based service request
const testRoomServiceRequest = async () => {
    const testData = {
        roomId: 'cmectc77j0003gl617g4kqrlk', // Room 102 ID
        hotelId: 'cmectc6bi0002gl61x1ohhqwe',
        serviceId: 'cmectc8ag000agl616eqw4qon', // Room Service ID (example)
        title: 'Need extra towels',
        description: 'Please bring 2 extra towels to room 102',
        guestName: 'Test Guest',
        priority: 'medium'
    };

    try {
        const response = await fetch('http://localhost:3000/api/guest/room-service-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        console.log('Response status:', response.status);
        console.log('Result:', result);
        
        if (response.ok) {
            console.log('✅ Room service request test passed!');
            console.log('Request ID:', result.serviceRequest.id);
        } else {
            console.log('❌ Room service request test failed!');
            console.log('Error:', result.error);
        }
    } catch (error) {
        console.log('❌ Network error:', error);
    }
};

testRoomServiceRequest();
