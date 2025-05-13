const chatForm = document.getElementById('chat-form');
const chatBox = document.getElementById('chat-box');

chatForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;

    chatBox.innerHTML += `<div class="user-message">${userInput}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    document.getElementById('user-input').value = '';

    try {
        const response = await fetch('https://skinea-ai-server-1.onrender.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userInput }),
        });

        const data = await response.json();
        if (data.reply) {
            chatBox.innerHTML += `<div class="bot-message">${formatBold(data.reply)}</div>`;
        } else {
            chatBox.innerHTML += `<div class="bot-message">Gabim në server.</div>`;
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        chatBox.innerHTML += `<div class="bot-message">Nuk u lidh me serverin.</div>`;
    }
});

// Funksioni për të bërë **fjale** në <strong>fjale</strong>
function formatBold(text) {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}