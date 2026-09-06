// App.tsx
import AppName from './components/AppName';
import Button from './components/Button';
import Chat from './components/Chat';
import Headers from './components/Headers';
import SearchBar from './components/SearchBar';
import Loader from './components/Loader';
import ChatScroller from './components/ChatScroller';
import { fromCurl } from 'curlhelper';
import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  prompt: string;
  response: string;
}

interface AppState {
  inputValue: string;
  chatMessages: ChatMessage[];
  isChatVisible: boolean;
  isHeadersVisible: boolean;
}

const App = () => {
  const [loading, setLoading] = useState(false);
  
  // Initialize state with an empty string
  const [state, setState] = useState<AppState>(() => {
    const localValue = localStorage.getItem('appState');
    if (localValue === null) {
      return {
        inputValue: '',
        chatMessages: [],
        isChatVisible: false,
        isHeadersVisible: true,
      };
    }
    return JSON.parse(localValue);
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);
  
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
    setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Update state with the new input value
    setState((prevState) => ({
      ...prevState,
      inputValue: event.target.value,
    }));
  };
  
  // Check if the input value is empty or contains only whitespace
  const noChatPrompt = state.inputValue.trim() === '';

  // Send the prompt to the API
  const handleSend = async () => {
    
    const chatPrompt = `You: ${state.inputValue}`;
    
    if(state.inputValue.trim() === '') {
      const emptyQuery: ChatMessage = {
          prompt: chatPrompt,
          response: `LiteBot: You didn't provide a query... Try again`,
      };

      // Append the messages to the array
      setState((prevState) => ({
        ...prevState,
        chatMessages: [...prevState.chatMessages, emptyQuery],
        isChatVisible: true,
        isHeadersVisible: false,
        inputValue: '',
      }));
      
      return;
    }
    
    try {

      setLoading(true);

      const responseContent = await fromCurl(`
        curl --request POST --url http://localhost:8080/query \
        --header 'Content-Type: application/json' \
        --data '{ "query": "${state.inputValue}" }'
      `).post();

      setLoading(false);
      
      const newChatMessage: ChatMessage = {
          prompt: chatPrompt,
          response: `LiteBot: ${responseContent.data}`,
      };

      // Append the new chat message to the array
      setState((prevState) => ({
        ...prevState,
        chatMessages: [...prevState.chatMessages, newChatMessage],
        isChatVisible: true,
        isHeadersVisible: false,
        inputValue: '',
      }));
    } catch (error) {
      setLoading(false);
      console.error('Error fetching chat completion: ', error);
      const errorMessage = 'Error fetching chat completion';
      const newChatMessage: ChatMessage = {
        prompt: chatPrompt,
        response: errorMessage,
      };
      // Append the error message to the array
      setState((prevState) => ({
        ...prevState,
        chatMessages: [...prevState.chatMessages, newChatMessage],
        isChatVisible: true,
        isHeadersVisible: false,
        inputValue: '',
      }));
    }
  };

  const handleClearChat = () => {
    // Clear the chat messages state
    setState((prevState) => ({
      ...prevState,
      chatMessages: [],
      isChatVisible: false,
      isHeadersVisible: true,
      inputValue: '',
    }));

    // Remove chat history from localStorage
    localStorage.removeItem('appState');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent the default action (newline)
      handleSend();
    }
  };

  return (
      <div>
        <div className="right">
          <h3>Social Profiles</h3>
          <a href="https://github.com/lucasthormann">GitHub</a>
          <a href="https://hub.docker.com/u/lucasthormann">Docker Hub</a>
          <a href="https://www.linkedin.com/in/lucasthormann">LinkedIn</a>
          <a href="https://app.joinhandshake.com/profiles/lucasthormann">Handshake</a>
        </div>
        <div className="left">
          <AppName>
            <div>
              <span>Lite </span>Bot
            </div>
          </AppName>
          {state.isHeadersVisible && (
            <div>
              <Headers>
                <div>
                  {!state.isChatVisible && (
                    <h1>Salutations</h1>
                  )}
                </div>
                <div>
                  <h3>What do you want to know about my creator?</h3>
                </div>
              </Headers>
            </div>
          )}
          {loading ? (
            <Chat>
              {state.isChatVisible && (
                <div className="chat-container">
                  <ChatScroller>
                    {state.chatMessages.map((message, index) => (
                      <div key={index} className="chatConversations">
                        <div className="chat-prompt">{message.prompt}</div>
                        <div className="chat-response">{message.response}</div>
                      </div>
                    ))}
                    <div className="clear-button-container">
                      <Button textContent="Clear Chat" handleClick={handleClearChat} />
                    </div>
                  </ChatScroller>
                </div>
	      )}
	      <div className="animation-container">
	        <Loader />
	        <span>Thinking...</span>
	      </div>
	    </Chat>
          ) : (
            <Chat>
              {state.isChatVisible && (
                <div className="chat-container">
                  <ChatScroller>
                    {state.chatMessages.map((message, index) => (
                      <div key={index} className="chatConversations">
                        <div className="chat-prompt">{message.prompt}</div>
                        <div className="chat-response">{message.response}</div>
                      </div>
                    ))}
                    <div className="clear-button-container">
                      <Button textContent="Clear Chat" handleClick={handleClearChat} />
                    </div>
                  </ChatScroller>
                </div>
	      )}
            </Chat>
          )}
          {loading ? (
            <div></div>
          ) : (
            <div className="searchBar-container">
              <SearchBar>
                <textarea
                  className="search-input"
                  placeholder="&ensp;Enter your query about Lucas&#10;&#10;&ensp;(Please keep it simple; I'm a smol model...)"
                  value={state.inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  textContent="Send"
                  handleClick={handleSend}
                  disabled={noChatPrompt | loading}
                />
              </SearchBar>
            </div>
          )}
        </div>
      </div>
  );
};

export default App;
