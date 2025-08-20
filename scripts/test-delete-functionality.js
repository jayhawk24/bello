// Test service request deletion functionality
const BASE_URL = 'http://localhost:3000';

async function testDeleteFunctionality() {
    console.log('🗑️ Testing Service Request Delete Functionality...\n');

    try {
        console.log('1. Testing manual cleanup endpoint...');
        
        // Test the manual cleanup endpoint
        const cleanupResponse = await fetch(`${BASE_URL}/api/cleanup?hours=168`, { // 7 days
            method: 'DELETE'
        });
        
        const cleanupResult = await cleanupResponse.json();
        
        if (cleanupResponse.ok) {
            console.log('✅ Manual cleanup endpoint working!');
            console.log(`   Deleted ${cleanupResult.deleted.serviceRequests} service requests`);
            console.log(`   Deleted ${cleanupResult.deleted.notifications} notifications`);
        } else {
            console.log('❌ Manual cleanup failed:', cleanupResult.error);
        }

        console.log('\n2. Cleanup functionality test completed!');
        console.log('\n📋 Admin Delete Features Available:');
        console.log('   • Individual service request deletion (🗑️ Delete button)');
        console.log('   • Bulk room request deletion (🗑️ Clear Requests button)');
        console.log('   • Automatic cleanup after 24 hours (cron job)');
        console.log('   • Manual cleanup via API (/api/cleanup)');
        
        console.log('\n⚠️ Note: To test individual/room deletion:');
        console.log('   1. Login as hotel_admin');
        console.log('   2. Go to /dashboard/staff-requests');
        console.log('   3. Look for red delete buttons (admin only)');

    } catch (error) {
        console.log('❌ Network error:', error);
    }
}

// Run the test
testDeleteFunctionality();
