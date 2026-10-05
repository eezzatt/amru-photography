import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LoginPage.css"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { login } = useContext(AuthContext)


    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const response = await fetch("http://localhost:3000/api/authenticate/login", {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
            if (response.ok) {
                const data = await response.json()
                login(data.token)
                navigate('/')
            }
            else {
                const data = await response.json()
                setError(data.error)
            }
        }
        catch (err) {
            setError("Internal server error. Please try again.")
        }
    }

    return (
        <div className="login-card">
            <form onSubmit={handleSubmit} className="login-form">
                <div className="login-email">
                    <label>Email: </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="login-password">
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                <button className="login-button" type="submit">Login</button>

                {error && <p>{error}</p>}
            </form>
        </div>
    )
}

export default LoginPage