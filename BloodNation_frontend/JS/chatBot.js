const logoRight = document.getElementById('logoRight');
const chatBoxRight = document.getElementById('chatBoxRight');
const deleteButton = document.getElementById('deleteButton');
const chatButton = document.getElementById('chatButton');
const inputChat = document.getElementById('inputChat');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chatForm');

document.getElementById('logoDiv').addEventListener('click', () => {
    logoRight.style.display = 'none';
    chatBoxRight.style.display = 'flex';
});

const closeChat = document.getElementById('closeChat').addEventListener('click', () => {
    logoRight.style.display = 'flex';
    chatBoxRight.style.display = 'none';
})


function appendChatMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = text;
    msgDiv.style.padding = '8px 12px';
    msgDiv.style.borderRadius = '8px';
    msgDiv.style.marginBottom = '8px';
    msgDiv.style.maxWidth = '85%';
    msgDiv.style.fontSize = '13px';
    msgDiv.style.lineHeight = '1.4';
    msgDiv.style.wordWrap = 'break-word';

    if (isUser) {
        msgDiv.style.backgroundColor = '#ff4da6';
        msgDiv.style.color = 'white';
        msgDiv.style.alignSelf = 'flex-end';
        msgDiv.style.marginLeft = 'auto';
    } else {
        msgDiv.style.backgroundColor = 'white';
        msgDiv.style.color = '#222';
        msgDiv.style.alignSelf = 'flex-start';
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
}

const allowed_keywords = [
    'blood', 'donate', 'donation', 'donor', 'patient', 'hospital', 'doctor',
    'bloodnation', 'blood nation', 'stock', 'unit', 'units', 'group', 'plasma',
    'platelet', 'platelets', 'rbc', 'hemoglobin', 'eligible', 'eligibility',
    'request', 'emergency', 'transfusion', 'bank', 'register', 'login',
    'dashboard', 'account', 'verify', 'verification', 'appointment', 'home',
    'a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'o+', 'o-', 'positive', 'negative',
    'hi', 'hello', 'hey', 'namaste'
]

chatForm.addEventListener('submit', chatFetch);

async function chatFetch(e) {
    e.preventDefault();
    const query = inputChat.value.trim();

    if (!query) return;

    appendChatMessage(query, true);
    inputChat.value = '';

    const isMatched = allowed_keywords.some(keyword => query.toLowerCase().includes(keyword));

    if (!isMatched) {
        appendChatMessage(
            "I can only answer questions related to Blood and BloodNation",
            false
        );
        return;
    }


    const botBubble = appendChatMessage('Thinking...', false);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/chat_request/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input_field: query })
        });

        const result = await response.json();

        if (response.status === 200) {
            botBubble.textContent = result.message || 'No response received.';
        }
    }
    catch (error) {
        console.error('Chatbot Fetch Error:', error);
        botBubble.textContent = 'Connection with server could not stablished';
    }
}

deleteButton.addEventListener('click', () => {
    inputChat.value = "";
    chatMessages.innerHTML = "";
})