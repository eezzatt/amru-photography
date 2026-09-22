import { useState, useEffect } from "react";

export function useAuth () {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect (() => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const payload = token.split('.')[1]
                const decodedPayload = atob(payload)
                const payloadObj = JSON.parse(decodedPayload)
                const expiry = payloadObj.exp
                const currentTime = Date.now() / 1000
                if (expiry > currentTime) {
                    setIsLoggedIn(true)
                }
            }
            catch (err) {
                console.log(err)
            }
        }
    }, [])

    return isLoggedIn
}