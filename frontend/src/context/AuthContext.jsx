import { createContext, useState } from "react";

export const AuthContext = createContext(null)

function isTokenValid(token) {
    if (!token) return false
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(base64))
        return payload.exp > Date.now() / 1000
    } catch {
        return false
    }
}

export function AuthProvider({ children }) {

    const [isLoggedIn, setIsLoggedIn] = useState(
        () => isTokenValid(localStorage.getItem('token'))
    )


    function login(token) {
        localStorage.setItem('token', token)
        setIsLoggedIn(true)
    }


    function logout() {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
    }

    return (
        <AuthContext value = {{isLoggedIn, login, logout}}>
            {children}
        </ AuthContext>
    )
}