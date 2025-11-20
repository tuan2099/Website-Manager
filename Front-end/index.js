// React Auth UI for Website Manager backend
// Lưu ý: file này giả định bạn load React/ReactDOM từ CDN trong HTML, ví dụ:
// <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
// <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
// <div id="root"></div>
// <script src="./index.js"></script>

const API_BASE_URL = 'http://localhost:3000';

const { useState } = React;

function saveTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  if (!headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // ignore
  }

  if (!res.ok) {
    const msg = (data && data.message) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

function TabButton({ active, onClick, children }) {
  return React.createElement(
    'button',
    {
      className: 'tab-button' + (active ? ' active' : ''),
      onClick,
      type: 'button',
    },
    children
  );
}

function LoginForm({ onSuccess, setStatus }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang đăng nhập...', 'info');
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      setStatus('Đăng nhập thành công', 'success');
      onSuccess && onSuccess(data.user);
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  return React.createElement(
    'form',
    { className: 'auth-form', onSubmit: handleSubmit },
    React.createElement('label', null,
      'Email',
      React.createElement('input', {
        type: 'email',
        value: email,
        onChange: (e) => setEmail(e.target.value),
        required: true,
      })
    ),
    React.createElement('label', null,
      'Mật khẩu',
      React.createElement('input', {
        type: 'password',
        value: password,
        onChange: (e) => setPassword(e.target.value),
        required: true,
      })
    ),
    React.createElement('button', { type: 'submit' }, 'Login')
  );
}

function RegisterForm({ setStatus }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang đăng ký...', 'info');
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      setStatus('Đăng ký thành công. Hãy đăng nhập.', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  return React.createElement(
    'form',
    { className: 'auth-form', onSubmit: handleSubmit },
    React.createElement('label', null,
      'Tên hiển thị',
      React.createElement('input', {
        type: 'text',
        value: name,
        onChange: (e) => setName(e.target.value),
        required: true,
      })
    ),
    React.createElement('label', null,
      'Email',
      React.createElement('input', {
        type: 'email',
        value: email,
        onChange: (e) => setEmail(e.target.value),
        required: true,
      })
    ),
    React.createElement('label', null,
      'Mật khẩu',
      React.createElement('input', {
        type: 'password',
        value: password,
        onChange: (e) => setPassword(e.target.value),
        required: true,
      })
    ),
    React.createElement('button', { type: 'submit' }, 'Register')
  );
}

function ChangePasswordForm({ setStatus }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang đổi mật khẩu...', 'info');
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      setStatus('Đổi mật khẩu thành công', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  return React.createElement(
    'form',
    { className: 'auth-form', onSubmit: handleSubmit },
    React.createElement('label', null,
      'Mật khẩu hiện tại',
      React.createElement('input', {
        type: 'password',
        value: currentPassword,
        onChange: (e) => setCurrentPassword(e.target.value),
        required: true,
      })
    ),
    React.createElement('label', null,
      'Mật khẩu mới',
      React.createElement('input', {
        type: 'password',
        value: newPassword,
        onChange: (e) => setNewPassword(e.target.value),
        required: true,
      })
    ),
    React.createElement('button', { type: 'submit' }, 'Đổi mật khẩu')
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [status, setStatusState] = useState({ message: '', type: 'info' });
  const [currentUser, setCurrentUser] = useState(null);

  const setStatus = (message, type) => {
    setStatusState({ message, type });
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore error, just clear token
    }
    clearTokens();
    setCurrentUser(null);
    setStatus('Đã logout', 'info');
  };

  const hasToken = !!getAccessToken();

  return React.createElement(
    'div',
    { className: 'app-container' },
    React.createElement('h1', null, 'Website Manager - Auth'),
    React.createElement(
      'div',
      { className: 'user-bar' },
      hasToken
        ? React.createElement('span', null, `Đã đăng nhập${currentUser ? `: ${currentUser.email}` : ''}`)
        : React.createElement('span', null, 'Chưa đăng nhập'),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: handleLogout,
          disabled: !hasToken,
        },
        'Logout'
      )
    ),
    React.createElement(
      'div',
      { className: 'tabs' },
      React.createElement(
        TabButton,
        { active: activeTab === 'login', onClick: () => setActiveTab('login') },
        'Login'
      ),
      React.createElement(
        TabButton,
        { active: activeTab === 'register', onClick: () => setActiveTab('register') },
        'Register'
      ),
      React.createElement(
        TabButton,
        { active: activeTab === 'changePassword', onClick: () => setActiveTab('changePassword') },
        'Change Password'
      )
    ),
    React.createElement(
      'div',
      { className: `status-bar ${status.type}` },
      status.message
    ),
    React.createElement(
      'div',
      { className: 'tab-content' },
      activeTab === 'login' &&
        React.createElement(LoginForm, {
          onSuccess: (user) => setCurrentUser(user),
          setStatus,
        }),
      activeTab === 'register' && React.createElement(RegisterForm, { setStatus }),
      activeTab === 'changePassword' && React.createElement(ChangePasswordForm, { setStatus })
    )
  );
}

function injectBasicStyles() {
  const style = document.createElement('style');
  style.innerHTML = `
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .app-container {
      background: #ffffff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
      width: 100%;
      max-width: 480px;
      box-sizing: border-box;
    }

    h1 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 20px;
      text-align: center;
    }

    .user-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .user-bar button {
      padding: 4px 10px;
      font-size: 13px;
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .tab-button {
      flex: 1;
      padding: 8px 0;
      border-radius: 4px;
      border: 1px solid #d0d0d0;
      background: #fafafa;
      cursor: pointer;
      font-size: 14px;
    }

    .tab-button.active {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }

    .status-bar {
      min-height: 20px;
      font-size: 13px;
      margin-bottom: 12px;
    }

    .status-bar.info {
      color: #4b5563;
    }

    .status-bar.success {
      color: #16a34a;
    }

    .status-bar.error {
      color: #dc2626;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .auth-form label {
      display: flex;
      flex-direction: column;
      font-size: 13px;
      color: #374151;
    }

    .auth-form input {
      margin-top: 4px;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #d1d5db;
      font-size: 14px;
    }

    .auth-form button[type='submit'] {
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: 4px;
      border: none;
      background: #2563eb;
      color: white;
      cursor: pointer;
      font-size: 14px;
    }

    .auth-form button[type='submit']:hover {
      background: #1d4ed8;
    }

    @media (max-width: 600px) {
      .app-container {
        margin: 0 12px;
      }
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
  injectBasicStyles();
  const rootEl = document.getElementById('root') || (function () {
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);
    return div;
  })();

  const root = ReactDOM.createRoot(rootEl);
  root.render(React.createElement(App));
});

