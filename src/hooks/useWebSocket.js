import { useEffect, useRef, useState, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const { 
    onOpen = () => {},
    onMessage = () => {},
    onError = () => {},
    onClose = () => {},
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    try {
      // 기존 연결이 있으면 정리
      if (ws.current) {
        ws.current.close();
      }

      setConnectionStatus('Connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = (event) => {
        console.log('WebSocket 연결 성공:', url);
        setConnectionStatus('Connected');
        reconnectAttempts.current = 0;
        onOpen(event);
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        onMessage(message);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        setConnectionStatus('Error');
        onError(error);
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code, event.reason);
        setConnectionStatus('Disconnected');
        onClose(event);

        // 자동 재연결 시도
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          console.log('최대 재연결 시도 횟수 초과');
        }
      };

    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
      setConnectionStatus('Error');
    }
  }, [url, onOpen, onMessage, onError, onClose, reconnectInterval, maxReconnectAttempts]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket이 연결되지 않았습니다.');
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      ws.current.close();
    }
    
    setConnectionStatus('Disconnected');
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    lastMessage,
    connectionStatus,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};

export default useWebSocket; 