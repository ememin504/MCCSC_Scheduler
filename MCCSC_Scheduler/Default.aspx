<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="MCCSC_Scheduler.Default" %>

<!DOCTYPE html>
<html>
<head runat="server">
    <title>User Login</title>
    <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="Scripts/css/default.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <link rel="stylesheet" href="Scripts/css/default.css">
    <script src="Scripts/js/script.js"></script>
    <script src="Scripts/js/default.js"></script>

</head>
<body>
     <header>
        <div class="header-content">
            <div class="logo-title">
                <img src="https://scontent.fmnl9-4.fna.fbcdn.net/v/t39.30808-1/518270094_122152807310398593_2388429758745708161_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=105&ccb=1-7&_nc_sid=2d3e12&_nc_eui2=AeGy2auOgKJ5uPZAbhy7feTGMHVHxYNVZ_gwdUfFg1Vn-N_zuyPYiU4R3CI8Tu9ziVN07H5NQQM4W1Xl6knp-rvI&_nc_ohc=l828_EmUgUMQ7kNvwF71nqv&_nc_oc=AdnM0IbunXXtD8ABTUZ3LtQuHmQleFjCJHpJeSAZZjwUFkBaI1Qub85uUD6zMXUBVvM&_nc_zt=24&_nc_ht=scontent.fmnl9-4.fna&_nc_gid=2YlrydcQBc37LN0jYWeC0A&oh=00_AfbU-vBBCMUbk_4BoGXreEwY-2exFQKKGNnMWKoYclxosA&oe=68DE8D6F" alt="Mandaue City College Logo" class="logo">
                <div class="title-text">
                    <h1>MCCSC SCHEDULER</h1>
                    <p class="subtitle">Online Reservation for Mandaue City Sports and Cultural Complex</p>
                </div>
            </div>
            <nav>
                <button class="nav-btn active" onclick="showSection('home')">HOME</button>
                <button class="nav-btn" onclick="showSection('login')">LOGIN</button>
                <button class="nav-btn" onclick="showSection('about')">ABOUT</button>
            </nav>
        </div>
    </header>
        <main>
        <!-- HOME SECTION -->
        <section id="home" class="section active">
            <div class="container">
                <div class="welcome-banner">
                    <h2>Welcome to MCCSC Scheduler</h2>
                    <p class="free-notice"> RESERVATION BOOKING </p>
                </div>

                <div class="content-grid">
                    <div class="calendar-container">
                        <h3>Select Your Date</h3>
                        <div id="calendar"></div>
                        <div class="selected-date">
                            <strong>Selected Date:</strong> <span id="displayDate">Please select a date</span>
                        </div>
                    </div>

                    <div class="registration-container">
                        <h3>Registration Form</h3>
                        <form id="registrationForm">
                            <div class="form-group">
                                <label for="firstName">First Name *</label>
                                <input type="text" id="firstName" required>
                            </div>

                             <div class="form-group">
                                <label for="firstName">First Name *</label>
                                <input type="text" id="middleInitial" required>
                            </div>

                            <div class="form-group">
                                <label for="lastName">Last Name *</label>
                                <input type="text" id="lastName" required>
                            </div>

                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" required>
                            </div>

                            <div class="form-group">
                                <label for="organization">Organization *</label>
                                <input type="text" id="organization" required>
                            </div>

                            <div class="form-group">
                                <label for="username">Username *</label>
                                <input type="text" id="username" required>
                            </div>

                            <div class="form-group">
                                <label for="password">Password *</label>
                                <input type="password" id="password" required>
                            </div>

                            <button type="submit" class="submit-btn" onclick="submitRegistrationRequest()">Register & Book</button>
                        </form>
                    </div>
                </div>

                <div class="facilities-section">
                    <h3>Available Facilities</h3>
                    <div class="facilities-grid">
                        <div class="facility-card">
                            <h4>🏀 Gymnasium</h4>
                            <p>Full-size indoor gym for various sports events</p>
                        </div>
                        <div class="facility-card">
                            <h4>🏐 Volleyball Court</h4>
                            <p>Professional volleyball court with complete equipment</p>
                        </div>
                        <div class="facility-card">
                            <h4>🏛️ Event Hall</h4>
                            <p>Multi-purpose hall for conferences and gatherings</p>
                        </div>
                        <div class="facility-card">
                            <h4>🏸 Basketball/Badminton Space</h4>
                            <p>Flexible court space for basketball and badminton</p>
                        </div>
                    </div>
                </div>
            </div>
        </section><!-- LOGIN SECTION -->
        <section id="login" class="section">
            <div class="container">
                <div class="login-box">
                    <h2>Login to Your Account</h2>
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginUsername">Username</label>
                            <input type="text" id="loginUsername" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <button type="submit" class="submit-btn" onclick="authenticateUser(); return false;">Login</button>
                    </form>
                </div>
            </div>
        </section>
        <!-- ABOUT SECTION -->
        <section id="about" class="section">
            <div class="container">
                <div class="about-content">
                    <h2>About MCCSC Scheduler</h2>
                    <div class="about-box">
                        <h3>Mandaue City College Sports and Cultural Complex</h3>
                        <p>The MCCSC Scheduler is a free online reservation system designed to streamline the booking process for Mandaue City College's sports and cultural facilities.</p>
                        
                        <h4>Our Mission</h4>
                        <p>To provide easy and accessible booking services for students, faculty, organizations, and community members who wish to utilize our state-of-the-art facilities.</p>
                        
                        <h4>Facilities Overview</h4>
                        <ul>
                            <li><strong>Gymnasium:</strong> Perfect for basketball games, assemblies, and large events</li>
                            <li><strong>Volleyball Court:</strong> Dedicated court for volleyball training and competitions</li>
                            <li><strong>Event Hall:</strong> Ideal for seminars, conferences, and cultural activities</li>
                            <li><strong>Basketball/Badminton Space:</strong> Versatile courts for multiple sports</li>
                        </ul>

                        <h4>Booking Policy</h4>
                        <p>All reservations are <strong>FREE OF CHARGE</strong>. This system is for booking purposes only. Please ensure you select the correct date and facility for your event.</p>

                        <h4>Contact Information</h4>
                        <p>Mandaue City College<br>
                        Established: 2005<br>
                        For inquiries, please contact the administration office.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>
    <footer>
        <p>&copy; 2025 Mandaue City College. All rights reserved. | Reservation System</p>
    </footer>
    <form id="aspForm" runat="server">    
        <!--<div class="container mt-5">
            <div class="card p-4 shadow">
                <h2 class="mb-4">Log In</h2>

                <div class="form-group mb-3">
                    <label for="username">Username:</label>
                    <input type="text" id="username" class="form-control" required />
                </div>

                <div class="form-group mb-3">
                    <label for="password">Password:</label>
                    <input type="password" id="password" class="form-control" required />
                </div>

                <button type="button" class="btn btn-primary w-100" onclick="authenticateUser()">
                    Log In
                </button>
            </div>
        </div>-->
    </form>
     <form id="form1">
     </form>
</body>
</html>
