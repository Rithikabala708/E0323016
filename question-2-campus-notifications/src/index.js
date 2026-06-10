import axios from 'axios';
import getTopPriorityNotifications from './priorityInbox.js';

// Authentication function
async function authenticate() {
  try {
    console.log('🔐 Authenticating...\n');
    
    const response = await axios.post(
      'http://4.224.186.213/evaluation-service/auth',
      {
        email: 'e0323016@sriher.edu.in',
        name: 'ritteeka',
        rollNo: 'e0323016',
        accessCode: 'DvwEDZ',
        clientID: 'd71c85af-8fb1-4f6d-a037-e51fcff2954f',
        clientSecret: 'AaVgetbwCDqfXxaJ'
      }
    );

    const token = response.data.access_token;
    console.log('✅ Authentication successful!\n');
    return token;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🎓 CAMPUS NOTIFICATION SYSTEM - PRIORITY INBOX');
    console.log('='.repeat(80) + '\n');

    // Step 1: Authenticate
    const token = await authenticate();

    // Step 2: Fetch and display top 10 priority notifications
    const topNotifications = await getTopPriorityNotifications(token, 10);

    console.log(`\n✨ Successfully retrieved ${topNotifications.length} priority notifications!`);
    console.log('\n' + '='.repeat(80) + '\n');

    // Display summary by type
    const summary = topNotifications.reduce((acc, notif) => {
      acc[notif.Type] = (acc[notif.Type] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Summary by Type:');
    Object.entries(summary).forEach(([type, count]) => {
      const emoji = type === 'Placement' ? '🔴' : type === 'Result' ? '🟡' : '🟢';
      console.log(`   ${emoji} ${type}: ${count}`);
    });

    console.log('\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
