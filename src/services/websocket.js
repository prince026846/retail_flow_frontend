/**
 * WebSocket service for real-time updates
 */

import { getCurrentApiUrl } from './api';

const LOCAL_API_PORTS = [8000, 8001, 8002, 8003, 8004, 8005];
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);
const WS_ENDPOINT = '/ws/analytics';

const toWsProtocol = (protocol) => (protocol === 'https:' ? 'wss:' : 'ws:');

const normalizeBasePath = (pathname) => {
  if (!pathname || pathname === '/') return '';
  return pathname.replace(/\/+$/, '');
};

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
    this.heartbeatInterval = null;
    this.reconnectTimer = null;
    this.isConnecting = false;
    this.eventListeners = new Map();
    this.authToken = null;
    this.shouldReconnect = true;
    this.pendingConnectionPromise = null;
  }

  buildWebSocketUrls(token) {
    const encodedToken = encodeURIComponent(token);
    const seen = new Set();
    const urls = [];

    const addUrl = (protocol, hostname, port, basePath = '') => {
      const hostWithPort = port ? `${hostname}:${port}` : hostname;
      const normalizedPath = normalizeBasePath(basePath);
      const prefixedUrl = `${protocol}//${hostWithPort}${normalizedPath}${WS_ENDPOINT}?token=${encodedToken}`;
      const rootUrl = `${protocol}//${hostWithPort}${WS_ENDPOINT}?token=${encodedToken}`;

      if (!seen.has(prefixedUrl)) {
        seen.add(prefixedUrl);
        urls.push(prefixedUrl);
      }

      if (!seen.has(rootUrl)) {
        seen.add(rootUrl);
        urls.push(rootUrl);
      }
    };

    try {
      const baseApiUrl = getCurrentApiUrl();
      const parsed = new URL(baseApiUrl);
      const protocol = toWsProtocol(parsed.protocol || 'http:');
      const basePath = normalizeBasePath(parsed.pathname);

      if (LOCAL_HOSTS.has(parsed.hostname)) {
        const preferredPort = Number(parsed.port);
        const orderedPorts = [
          ...new Set([preferredPort, ...LOCAL_API_PORTS].filter((port) => Number.isInteger(port) && port > 0))
        ];
        orderedPorts.forEach((port) => addUrl(protocol, parsed.hostname, port, basePath));
      } else {
        addUrl(protocol, parsed.hostname, parsed.port, basePath);
      }
    } catch (error) {
      console.warn('Failed to derive WebSocket URLs from API base URL:', error);
    }

    // Fallback local URLs for development if current API base URL is unavailable.
    if (urls.length === 0) {
      LOCAL_API_PORTS.forEach((port) => {
        addUrl('ws:', '127.0.0.1', port);
      });
    }

    return urls;
  }

  connect(token) {
    if (!token) {
      return Promise.reject(new Error('WebSocket token is required'));
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.pendingConnectionPromise) {
      return this.pendingConnectionPromise;
    }

    this.authToken = token;
    this.shouldReconnect = true;
    const websocketUrls = this.buildWebSocketUrls(token);

    this.pendingConnectionPromise = new Promise((resolve, reject) => {
      let attempt = 0;
      let lastError = null;

      const tryNextUrl = () => {
        if (attempt >= websocketUrls.length) {
          this.isConnecting = false;
          reject(lastError || new Error('Failed to connect to WebSocket on all configured ports'));
          return;
        }

        const wsUrl = websocketUrls[attempt];
        attempt += 1;
        this.isConnecting = true;

        try {
          const socket = new WebSocket(wsUrl);
          this.ws = socket;
          let opened = false;

          socket.onopen = () => {
            opened = true;
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            console.log(`WebSocket connected: ${wsUrl}`);

            this.startHeartbeat();
            this.sendSafe({
              type: 'subscribe',
              subscriptions: ['sales_update', 'order_created']
            });

            this.emit('connected', { url: wsUrl });
            resolve();
          };

          socket.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              const eventType = message?.type;
              const payload = message?.data ?? message;

              if (eventType) {
                this.emit(eventType, payload);
              }

              this.emit('message', message);
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          };

          socket.onclose = (event) => {
            if (this.ws === socket) {
              this.ws = null;
            }

            this.stopHeartbeat();
            this.isConnecting = false;

            if (!opened) {
              lastError = new Error(`WebSocket connection failed for ${wsUrl} (code: ${event.code})`);
              tryNextUrl();
              return;
            }

            this.emit('disconnected', { code: event.code, reason: event.reason });

            if (this.shouldReconnect && event.code !== 1000) {
              this.scheduleReconnect();
            }
          };

          socket.onerror = (event) => {
            console.error(`WebSocket error on ${wsUrl}:`, event);
          };
        } catch (error) {
          lastError = error;
          this.ws = null;
          this.isConnecting = false;
          tryNextUrl();
        }
      };

      tryNextUrl();
    }).finally(() => {
      this.pendingConnectionPromise = null;
    });

    return this.pendingConnectionPromise;
  }

  scheduleReconnect() {
    if (!this.authToken) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max WebSocket reconnect attempts reached');
      return;
    }

    this.reconnectAttempts += 1;
    const delay = this.reconnectInterval * this.reconnectAttempts;

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.authToken).catch((error) => {
        console.error('WebSocket reconnect failed:', error);
      });
    }, delay);
  }

  sendSafe(payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.ws.send(JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to send WebSocket payload:', error);
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    this.authToken = null;
    this.stopHeartbeat();
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this.eventListeners.clear();
    this.isConnecting = false;
    this.pendingConnectionPromise = null;
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.sendSafe({ type: 'ping' });
    }, 30000); // Send ping every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Event listener methods
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  // Check if WebSocket is connected
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Get connection state
  getState() {
    if (!this.ws) return 'DISCONNECTED';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
