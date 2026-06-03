const http = require('http');

async function doFetch(path, method = 'POST', data = null) {
  const url = new URL(`http://localhost:8080${path}`);
  if (method === 'GET' && data) {
    Object.keys(data).forEach(k => url.searchParams.append(k, data[k]));
  } else if (method === 'POST' && data) {
    Object.keys(data).forEach(k => url.searchParams.append(k, data[k]));
  }
  
  console.log(`[HTTP] ${method} ${url.toString()}`);
  const options = {
    method
  };

  try {
    const res = await fetch(url, options);
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch(e) {
    console.error("Fetch error:", e);
    throw e;
  }
}

async function listenSSE(path, query, expectedEvents) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:8080${path}`);
    Object.keys(query).forEach(k => url.searchParams.append(k, query[k]));
    const req = http.get(url, (res) => {
      let buffer = '';
      res.on('data', (chunk) => {
        const chunkStr = chunk.toString();
        buffer += chunkStr;
        
        let blocks = buffer.split('\n\n');
        buffer = blocks.pop(); // keep last incomplete block in buffer
        
        for (let block of blocks) {
          let lines = block.split('\n');
          let currentEvent = null;
          let currentData = '';
          
          for (let line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              currentData = line.replace('data:', '').trim();
            }
          }
          
          if (currentEvent && expectedEvents.includes(currentEvent)) {
            console.log(`[SSE] Received expected event: ${currentEvent} with data: ${currentData}`);
            let parsedData = {};
            try {
              parsedData = JSON.parse(currentData || '{}');
            } catch {
              parsedData = currentData; // If it's a string like "FINISHED" or "STARTED"
            }
            resolve({event: currentEvent, data: parsedData});
            req.destroy();
            return;
          }
        }
      });
      res.on('end', () => resolve(null));
    });
    req.on('error', reject);
    
    // Timeout
    setTimeout(() => {
      req.destroy();
      resolve(null);
    }, 5000);
  });
}

async function runTest() {
  try {
    console.log("=== STARTING QA TEST ===");
    
    // Teacher Flow
    console.log("Logging in teacher...");
    let authData = await doFetch('/teacher-login', 'POST', { usernameOrEmail: 'teacher', password: 'password123' });
    console.log("Teacher login:", authData);
    if (!authData.success) throw new Error("Teacher login failed");
    const teacherToken = authData.token;

    console.log("Creating race...");
    let raceData = await doFetch('/create-race', 'POST', { token: teacherToken, raceTitle: 'QA Race' });
    console.log("Race created:", raceData);
    if (!raceData.success) throw new Error("Race creation failed");
    
    const raceId = raceData.raceId;
    const raceCode = raceData.raceCode;
    
    // Student Flow
    console.log("Student joining...");
    let studentData = await doFetch('/join-race', 'POST', { raceCode: raceCode, displayName: 'Student1' });
    console.log("Student joined:", studentData);
    const studentToken = studentData.studentToken;
    
    // Test SSE Subscriptions
    console.log("Setting up SSE...");
    const teacherSSEPromise = listenSSE('/subscribe-race-dashboard', { token: teacherToken, raceId }, ['race-started', 'participant-progress-updated', 'race-finished']);
    const studentSSEPromise = listenSSE('/subscribe-student-race', { token: studentToken, raceId }, ['race-started', 'participant-progress-updated', 'race-finished']);
    
    // Wait a sec for connections
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Starting race...");
    let startRes = await doFetch('/start-race', 'POST', { token: teacherToken, raceId });
    console.log("Start race:", startRes);
    
    const teacherEvent = await teacherSSEPromise;
    const studentEvent = await studentSSEPromise;
    console.log("Teacher Event:", teacherEvent ? teacherEvent.event : 'None');
    console.log("Student Event:", studentEvent ? studentEvent.event : 'None');
    
    if (teacherEvent?.event !== 'race-started' || studentEvent?.event !== 'race-started') {
      console.warn("WARNING: Did not receive race-started correctly or timed out. But continuing.");
    }
    
    console.log("Getting question...");
    let question = await doFetch('/get-current-question', 'GET', { token: studentToken, raceId });
    console.log("Question:", question);
    
    if (!question || !question.questionId) throw new Error("No question returned");
    
    console.log("Submitting answer...");
    let ansRes = await doFetch('/submit-answer', 'POST', { token: studentToken, raceId, questionId: question.questionId, selectedOptionId: question.options ? question.options[0].id : -1 });
    console.log("Answer response:", ansRes);
    
    console.log("Getting updated state...");
    let state = await doFetch('/get-student-race-state', 'GET', { token: studentToken, raceId });
    console.log("State:", state.playerState);
    
    // Set up SSE for finished event
    console.log("Setting up SSE for finished event...");
    const teacherFinishedPromise = listenSSE('/subscribe-race-dashboard', { token: teacherToken, raceId }, ['race-finished']);
    const studentFinishedPromise = listenSSE('/subscribe-student-race', { token: studentToken, raceId }, ['race-finished']);
    
    // Wait a sec for connections to establish
    await new Promise(r => setTimeout(r, 1000));

    console.log("Finishing race...");
    let finishRes = await doFetch('/finish-race', 'POST', { token: teacherToken, raceId });
    console.log("Finish race response:", finishRes);
    if (!finishRes.success) throw new Error("Finishing race failed");
    
    console.log("Waiting for race-finished SSE events...");
    const teacherFinishedEvent = await teacherFinishedPromise;
    const studentFinishedEvent = await studentFinishedPromise;
    console.log("Teacher Finished Event:", teacherFinishedEvent ? teacherFinishedEvent.event : 'None');
    console.log("Student Finished Event:", studentFinishedEvent ? studentFinishedEvent.event : 'None');
    
    if (teacherFinishedEvent?.event !== 'race-finished' || studentFinishedEvent?.event !== 'race-finished') {
      throw new Error("Did not receive race-finished SSE event on both teacher and student streams!");
    }
    console.log("SSE race-finished verified successfully!");

    console.log("Fetching race results...");
    let results = await doFetch('/get-race-results', 'GET', { token: teacherToken, raceId });
    console.log("Race results:", results);
    if (!results || !results.leaderboard || results.leaderboard.length === 0) {
      throw new Error("Failed to retrieve race results or leaderboard is empty");
    }
    console.log("Race winner:", results.winner);
    
    console.log("Getting student state after finish...");
    let stateAfterFinish = await doFetch('/get-student-race-state', 'GET', { token: studentToken, raceId });
    console.log("State after finish raceStatus:", stateAfterFinish.raceStatus);
    if (stateAfterFinish.raceStatus !== 'FINISHED') {
      throw new Error("Student state does not reflect raceStatus = 'FINISHED' after race finish");
    }
    
    console.log("=== QA TEST SUCCESS ===");
  } catch (e) {
    console.error("TEST FAILED:", e);
    process.exit(1);
  }
}

runTest();
