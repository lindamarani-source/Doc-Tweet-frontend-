import Link from 'react-router-dom';

function Login() {
  return (
    <>
      <div>
        <div>
          <h1>Login Page</h1>
        </div>
        <div>
          <form>
            <div>
              <h1>Login to Doc-Tweet</h1>
            </div>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" />
            <label for="password">Password</label>
            <input type="password" id="password" name="password" />
            <button type="submit">Login</button>
          </form>
        </div>
        <div>
          <h2>Dont have an acoount?</h2>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </>
  )
}

export default Login;