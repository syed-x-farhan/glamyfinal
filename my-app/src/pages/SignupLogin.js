import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/index.css';
import { useAuth } from '../context/sign-in_sign-up_context';

function SignupLogin() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
    setSuccessMessage('');
    setError('');
  };

  const handleSignInClick = () => {
    setIsSignUpMode(false);
    setSuccessMessage('');
    setError('');
  };

  const showTemporaryMessage = (setMessageFunction, message) => {
    setMessageFunction(message);
    setTimeout(() => {
      setMessageFunction('');
    }, 2000);
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    const userData = {
      firstName: event.target[0].value,
      lastName: event.target[1].value,
      email: event.target[2].value,
      password: event.target[3].value
    };

    const result = await signUp(userData);
    if (result.success) {
      showTemporaryMessage(setSuccessMessage, 'Registration successful! Please sign in to continue.');
      event.target.reset();
      setTimeout(() => {
        setIsSignUpMode(false);
      }, 2000);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = event.target[0].value;
    const password = event.target[1].value;

    const result = await signIn(email, password);
    if (result.success) {
      navigate('/home');
    } else if (result.error) {
      showTemporaryMessage(setError, result.error);
    }
  };

  return (
    <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}

      <div className="forms-container">
        <div className="signin-signup">
          {isSignUpMode ? (
            <form onSubmit={handleSignUp} className="sign-up-form">
              <h2 className="title">Sign up</h2>
              <div className="input-field">
                <i className="fas fa-user"></i>
                <input type="text" placeholder="First name" required />
              </div>
              <div className="input-field">
                <i className="fas fa-user"></i>
                <input type="text" placeholder="Last name" required />
              </div>
              <div className="input-field">
                <i className="fas fa-envelope"></i>
                <input type="email" placeholder="Email" required />
              </div>
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input type="password" placeholder="Password" required />
              </div>
              <input 
                type="submit" 
                className="btn" 
                value={loading ? 'Please wait...' : 'Sign up'}
                disabled={loading}
              />
            </form>
          ) : (
            <form onSubmit={handleLogin} className="sign-in-form">
              <h2 className="title">Sign in</h2>
              <div className="input-field">
                <i className="fas fa-envelope"></i>
                <input type="email" placeholder="Email" required />
              </div>
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input type="password" placeholder="Password" required />
              </div>
              <input 
                type="submit" 
                className="btn" 
                value={loading ? 'Please wait...' : 'Login'}
                disabled={loading}
              />
            </form>
          )}
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>Welcome To Glamy</h3>
            <p>Where swiping right gets you killer outfits instead of awkward first dates.</p>
            <button className="btn transparent" onClick={handleSignUpClick}>Sign up</button>
          </div>
          <img src="img/log.svg" className="image" alt="" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>Welcome To Glamy</h3>
            <p>No need to impress with cheesy pick-up lines—just bring your best fashion sense and let’s slay the runway (or the grocery store) together!</p>
            <button className="btn transparent" onClick={handleSignInClick}>Sign in</button>
          </div>
          <img src="img/register.svg" className="image" alt="" />
        </div>
      </div>
    </div>
  );
}

export default SignupLogin;
