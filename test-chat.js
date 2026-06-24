const http = require('http');

const data = JSON.stringify({ email: 'sv@hust.edu.vn', password: 'password123' });

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    const parsed = JSON.parse(body);
    console.log("Login response:", parsed);
    const token = parsed.data?.accessToken;
    console.log('Got token:', token ? 'yes' : 'no');
    
    if (!token) return;
    // Now call chatbot
    const chatData = JSON.stringify({ content: 'chào bạn' });
    const chatOptions = {
      hostname: 'localhost',
      port: 3002,
      path: '/chatbot/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(chatData)
      }
    };
    
    const chatReq = http.request(chatOptions, (chatRes) => {
      let chatBody = '';
      chatRes.on('data', (chunk) => { chatBody += chunk; });
      chatRes.on('end', () => {
        console.log('Chatbot response:', chatRes.statusCode, chatBody);
      });
    });
    
    chatReq.write(chatData);
    chatReq.end();
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
