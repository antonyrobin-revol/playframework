// Client-side AI Chat Streaming
class AIChatSession {
  constructor(apiEndpoint) {
    this.apiEndpoint = apiEndpoint;
    this.eventSource = null;
    this.responseContainer = null;
  }

  startChat(message) {
    // Start EventSource connection
    this.eventSource = new EventSource(`${this.apiEndpoint}?query=${encodeURIComponent(message)}`);

    let fullResponse = '';

    // Handle individual chunks
    this.eventSource.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = event.data;
      }

      if (data.type === 'chunk') {
        fullResponse += data.content;
        this.updateUI(fullResponse);
      } else if (data.type === 'complete') {
        console.log('AI response complete:', fullResponse);
        this.onComplete(fullResponse);
        this.closeConnection(); // End the stream
      } else {
        fullResponse += data;
        this.updateUI(fullResponse);
      }
    };

    // Handle errors
    this.eventSource.onerror = (error) => {
      console.error('Streaming error:', error);
      this.closeConnection();
    };
  }

  updateUI(response) {
    if (this.responseContainer) {
      this.responseContainer.innerHTML = response;
    }
  }

  onComplete(finalResponse) {
    console.log('Chat completed with full response');
    // Perform post-processing actions here
  }

  closeConnection() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

// Usage
const chatSession = new AIChatSession('/java/api/ai-stream');
function sendChatMessage(userInput) {
  chatSession.responseContainer = document.getElementById('response-container');
  chatSession.responseContainer.style.textAlign = 'left';
  chatSession.startChat(userInput);
}

// Add event listener to start chat on button click
document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');

  startButton.addEventListener('click', (event) => {
    sendChatMessage('start');
  });
  stopButton.addEventListener('click', (event) => {
    chatSession.closeConnection();
  });

  // Alternative method if button doesn't exist yet:
  /*
  document.addEventListener('click', (e) => {
    if (e.target.id === 'startButton') {
      sendChatMessage('start');
    }
  });
  */
});