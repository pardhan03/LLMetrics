const BASE_URL = 'http://localhost:4000/api';

async function runTests() {
  console.log('🏁 Starting Integration Test Suite for LLMetrics...');
  let testSessionId = null;

  try {
    // 1. Create a session using the newly supported gemini-2.5-flash model
    console.log('\n1. Creating a new telemetry session...');
    const createRes = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'google',
        model: 'gemini-2.5-flash',
        title: 'Automated Test Session',
        isStreaming: false
      })
    });

    if (!createRes.ok) {
      throw new Error(`Create session failed: ${createRes.status} - ${await createRes.text()}`);
    }

    const sessionData = await createRes.json();
    testSessionId = sessionData.id;
    console.log(`✅ Session Created Successfully! ID: ${testSessionId}`);
    console.log(`   Model: ${sessionData.model}, Title: "${sessionData.title}"`);

    // 2. List all sessions and verify our created session is present
    console.log('\n2. Fetching session list...');
    const listRes = await fetch(`${BASE_URL}/sessions`);
    if (!listRes.ok) {
      throw new Error(`List sessions failed: ${listRes.status}`);
    }
    const listData = await listRes.json();
    const found = listData.some(s => s.id === testSessionId);
    if (found) {
      console.log('✅ Session List Verified: Created session is active and present!');
    } else {
      throw new Error('❌ Created session was not found in the sessions list.');
    }

    // 3. Send a patch request to update session status
    console.log('\n3. Patching session status...');
    const updateRes = await fetch(`${BASE_URL}/sessions/${testSessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'active'
      })
    });
    if (!updateRes.ok) {
      throw new Error(`Update session failed: ${updateRes.status}`);
    }
    const updateData = await updateRes.json();
    console.log(`✅ Session Update Verified: Status is "${updateData.status}"`);

    // 4. Test deleting the session to verify cascading deletion on the database
    console.log(`\n4. Deleting session ${testSessionId} to verify cascade constraints...`);
    const deleteRes = await fetch(`${BASE_URL}/sessions/${testSessionId}`, {
      method: 'DELETE'
    });

    if (deleteRes.status === 204) {
      console.log('✅ Session Deleted Successfully with HTTP 204 No Content!');
    } else {
      throw new Error(`❌ Unexpected delete response status: ${deleteRes.status}`);
    }

    // 5. Verify the session is no longer in the database session list
    console.log('\n5. Verifying session is evicted from list...');
    const listVerifyRes = await fetch(`${BASE_URL}/sessions`);
    const listVerifyData = await listVerifyRes.json();
    const exists = listVerifyData.some(s => s.id === testSessionId);
    if (!exists) {
      console.log('✅ Eviction Verified: Session no longer exists in DB!');
    } else {
      throw new Error('❌ Session still exists in the sessions list after deletion.');
    }

    console.log('\n🎉 ALL INTEGRATION TEST CASES PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ Test Suite Failed!');
    console.error('Error Message:', error.message);

    // Clean up if needed
    if (testSessionId) {
      try {
        await fetch(`${BASE_URL}/sessions/${testSessionId}`, { method: 'DELETE' });
      } catch (err) { }
    }
    process.exit(1);
  }
}

runTests();
