import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./AuthPage.css";

const AuthPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isLogin ? "/login" : "/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth${url}`,
        payload
      );

      if (isLogin) {
        const { token } = response.data;
        console.log("Received token:", token);

        try {
          const decoded = jwtDecode(token);
          console.log("Decoded token:", decoded);

          localStorage.setItem("authToken", token);
          console.log("Stored token:", localStorage.getItem("authToken"));

          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Fetch user data from /me endpoint
          const userResponse = await axios
            .get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .catch((err) => {
                throw new Error(`API Error: ${err.response?.status}`);
            });
            console.log('User Data from /me:', userResponse.data); // Add this

          setUser({
            id: userResponse.data.id,
            username: userResponse.data.username,
            email: userResponse.data.email,
          });

          localStorage.setItem('user', JSON.stringify({
            id: userResponse.data.id,
            username: userResponse.data.username,
            email: userResponse.data.email
          }));
          

          navigate("/chat");
        } catch (err) {
            console.error('Full error:', err);
            setError(
              err.response?.data?.error || 
              err.message || 
              'Authentication failed'
            );
          localStorage.removeItem("authToken");
        }
      } else {
        setUser(response.data.user);
        navigate("/chat");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="6"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>
      </form>

      <div className="toggle-auth">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="toggle-button"
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
