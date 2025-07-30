import { useState, useEffect, useRef, useCallback } from 'react';

let wsInstance = null;
let subscribers = [];
let status = 'connecting';

const connect = (url) => {
  if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) {
    return;
  }

  console.log(`🔌 Connecting to WebSocket at ${url}...`);
  wsInstance = new WebSocket(url);
  status = 'connecting';

  wsInstance.onopen = () => {
    console.log('✅ WebSocket connected successfully');
    status = 'open';
    subscribers.forEach(s => s.setStatus(status));
  };

  wsInstance.onclose = (event) => {
    console.log(`🔌 WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
    status = 'closed';
    subscribers.forEach(s => s.setStatus(status));
    
    // Only reconnect if there are active subscribers
    if (subscribers.length > 0) {
      console.log('🔄 Attempting to reconnect in 5 seconds...');
      setTimeout(() => connect(url), 5000);
    }
  };

  wsInstance.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
    status = 'error';
    subscribers.forEach(s => s.setStatus(status));
  };

  wsInstance.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('📨 WebSocket message received:', message.type, message.data);
      subscribers.forEach(s => s.handleMessage(message));
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error, 'Raw data:', event.data);
    }
  };
};

const useWebSocket = (url) => {
  const [messages, setMessages] = useState([]);
  const [wsStatus, setWsStatus] = useState(status);
  const isMounted = useRef(true);

  const handleMessage = useCallback((message) => {
    if (isMounted.current) {
      setMessages((prev) => [...prev, message]);
    }
  }, []);

  const setStatus = useCallback((newStatus) => {
    if (isMounted.current) {
      setWsStatus(newStatus);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const subscriber = { handleMessage, setStatus };
    subscribers.push(subscriber);
    connect(url);

    return () => {
      isMounted.current = false;
      subscribers = subscribers.filter(s => s !== subscriber);
    };
  }, [url, handleMessage, setStatus]);

  const sendMessage = useCallback((message) => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsInstance.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  }, []);

  return { messages, status: wsStatus, sendMessage };
};

export default useWebSocket;
