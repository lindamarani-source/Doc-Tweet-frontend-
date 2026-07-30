import Link from 'react-router-dom';

function Signup() {
  return (
    <>
      <div>
        <div>
          <h1>Signup</h1>
          <div>
            <form>
              <div>
                <h2>Register to Doc-Tweet</h2>
              </div>
                <label for="username">Username</label>
                <input type="text" id="username" name="username" />
                <label for="email">Email</label>
                <input type="email" id="email" name="email" />
                <label for="password">Password</label>
                <input type="password" id="password" name="password" />
                <label for="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password" name="confirm-password" />
                <button type="submit">Signup</button>
            </form>
          </div>
          <div>
            <h2>Already have an account?</h2>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup;