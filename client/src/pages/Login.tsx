import { Link } from 'react-router-dom';
import './Auth.css';

function Login() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Login to your account</p>

          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                className="auth-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="auth-input"
              />
            </div>

            <button type="submit" className="auth-button">
              Login
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
