const API_URL = 'http://localhost:3000/api/tasks';

async function runTests() {
  console.log('🚀 --- Starting Google Sheets API Route Tests ---\n');

  try {
    // ==========================================
    // 1. Test GET Route
    // ==========================================
    console.log('1️⃣  Testing GET /api/tasks...');
    const getRes = await fetch(API_URL);
    const getData = await getRes.json();
    
    if (getRes.ok && getData.success) {
      console.log(`✅ GET SUCCESS: Found ${getData.tasks.length} task(s) currently in the sheet.\n`);
    } else {
      console.error(`❌ GET FAILED:`, getData.error || getData);
      return; // Stop tests if we can't even read the sheet
    }

    // ==========================================
    // 2. Test POST Route
    // ==========================================
    console.log('2️⃣  Testing POST /api/tasks (Adding a dummy task)...');
    
    // Creating dummy data matching our schema exactly
    const dummyTask = {
      client: 'Test Client API',
      subClient: 'Test Sub Client',
      videoTitle: 'Dummy API Test Video - ' + Date.now(),
      rawVideoLink: 'https://drive.google.com/test-raw-link',
      directions: 'Please edit with fast cuts.',
      changes: 'None yet',
      editorName: 'API Script Bot',
      startDate: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
      endDate: '2099-12-31',
      status: 'Not Started',
      videoLink: '',
      revisions: 0,
      complexity: 'Low',
      price: 150
    };

    const postRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dummyTask)
    });
    
    const postData = await postRes.json();
    let newRowIndex = null;

    if (postRes.ok && postData.success) {
      newRowIndex = postData.rowIndex;
      console.log(`✅ POST SUCCESS: Successfully added new task! Assigned to row index: ${newRowIndex}.\n`);
    } else {
      console.error(`❌ POST FAILED:`, postData.error || postData);
      return; 
    }

    // ==========================================
    // 3. Test PATCH Route
    // ==========================================
    console.log(`3️⃣  Testing PATCH /api/tasks (Updating row ${newRowIndex} to 'Completed')...`);
    
    const patchRes = await fetch(API_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rowIndex: newRowIndex,
        status: 'Completed',
        videoLink: 'https://youtu.be/api_test_dummy_link',
        revisions: 1
      })
    });
    
    const patchData = await patchRes.json();

    if (patchRes.ok && patchData.success) {
      console.log(`✅ PATCH SUCCESS: Successfully updated task at row ${newRowIndex}!\n`);
    } else {
      console.error(`❌ PATCH FAILED:`, patchData.error || patchData);
      return;
    }

    console.log('🎉 --- ALL API TESTS PASSED SUCCESSFULLY! ---');

  } catch (error) {
    console.error('💥 TEST SCRIPT CRASHED. Is your Next.js server running?', error.message);
  }
}

runTests();
