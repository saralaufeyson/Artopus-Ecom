import { Link } from 'react-router-dom';
import './Auth.css';

function Register() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Artopus today</p>

          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                className="auth-input"
              />
            </div>

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
                placeholder="Create a password"
                className="auth-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                placeholder="Confirm your password"
                className="auth-input"
              />
            </div>

            <button type="submit" className="auth-button">
              Register
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
