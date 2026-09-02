import { useState } from "react"
import { useNavigate } from "react-router-dom"

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()


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
                localStorage.setItem("token", data.token)
                navigate('/admin-dashboard')
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
        <div>
            <form onSubmit={handleSubmit}>
                <label>Email: </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Password: </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>

                {error && <p>{error}</p>}
            </form>
        </div>
    )
}

export default LoginPage