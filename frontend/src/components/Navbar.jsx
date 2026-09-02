import './Navbar.css'

function Navbar() {
    return (
        <nav>
            <div className="logo">Amru's Photography</div>
            <div className="nav_links">
                <ul>
                    <li><a>Contact</a></li>
                    <li><a>FAQs</a></li>
                    <li><a>Reviews</a></li>
                    <li><a href='/login'>Admin-Login</a></li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar