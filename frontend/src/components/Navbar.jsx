import './Navbar.css'
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Navbar() {
    const { isLoggedIn, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/')
    }

    return (
        <nav>
            <div className="logo">
                <Link to="/">Amru's Photography</Link>
            </div>
            <div className="nav_links">
                <ul>
                    {!isLoggedIn && <li><Link to="/login">Admin-Login</Link></li>}
                    {isLoggedIn && <li onClick={handleLogout}>Logout</li>}
                </ul>
            </div>
        </nav>
    )
}

export default Navbar