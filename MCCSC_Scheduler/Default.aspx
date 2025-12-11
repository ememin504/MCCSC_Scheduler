﻿<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="MCCSC_Scheduler.Default" %>
<!DOCTYPE html>
<html>
<head runat="server">
    <title>User Login</title>
    <link rel="stylesheet" type="text/css" href="Lib/bootstrap/5.3.6/css/bootstrap.min.css" />
    <script type="text/javascript" src="Lib/bootstrap/5.3.6/js/bootstrap.bundle.min.js"></script>
    <script type="text/javascript" src="Scripts/js/global.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <link rel="stylesheet" type="text/css" href="Scripts/css/default.css" />
    <script type="text/javascript" src="Scripts/js/default.js" defer></script>
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
                <button type="button" class="nav-btn active">HOME</button>
                <button type="button" class="nav-btn">LOGIN</button>
                <button type="button" class="nav-btn">ABOUT</button>
            </nav>
        </div>
    </header>

    <main>
        <!-- HOME SECTION -->
        <section id="home" class="section" style="display: block;">
            <div class="container">
                <div class="welcome-banner">
                    <h2>Welcome <span class="guest-text">Guest</span></h2>
                </div>
            
                <div class="content-grid">
                    <!-- Calendar Section -->
                    <div class="calendar-container">
                        <div id="calendar"></div>
                        <div class="selected-date">
                            <strong>Selected Date:</strong> <span id="displayDate">Please select a date</span>
                        </div>
                    </div>
                
                    <!-- Registration Form -->
                    <div class="registration-container">
                        <h3>Register</h3>
                        <form id="registrationForm">
                            <div class="form-group">
                                <label for="firstName">Firstname</label>
                                <input type="text" id="firstName" required>
                            </div>

                            <div class="form-group">
                                <label for="lastName">Lastname</label>
                                <input type="text" id="lastName" required>
                            </div>

                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="contactNumber">Contact Number</label>
                                <input type="tel" id="contactNumber" required>
                            </div>

                            <div class="form-group">
                                <label for="organization">Organization</label>
                                <input type="text" id="organization" required>
                            </div>

                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" id="username" required>
                            </div>

                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" required>
                            </div>

                            <button type="button" class="submit-btn">Register</button>
                        </form>
                    
                        <div class="login-link">
                            Already Registered? <a href="#">Login</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- LOGIN SECTION -->
        <section id="login" class="section" style="display: none;">
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
                        <button type="button" class="submit-btn">Login</button>
                    </form>
                    <div class="login-link">
                        Don't have an account? <a href="#">Register</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- ABOUT SECTION -->
        <section id="about" class="section" style="display: none;">
            <div class="container">
                <div class="about-content">
                    <h2>About MCCSC Scheduler</h2>
                    <div class="about-box">
                        <h3>Mandaue City Sports and Cultural Complex</h3>
                        <p>The MCCSC Scheduler is a free online reservation system designed to streamline the booking process for Mandaue City College's sports and cultural facilities.</p>
                    
                        <h4>Our Mission</h4>
                        <p>To provide easy and accessible booking services for students, faculty, organizations, and community members who wish to utilize our state-of-the-art facilities.</p>
             
                        <h4>Booking Policy</h4>
                        <p>All reservations are <strong>FREE OF CHARGE</strong>. This system is for booking purposes only. Please ensure you select the correct date and facility for your event.</p>

                        <h4>Contact Information</h4>
                        <p>Mandaue City Sports and Cultural Complex<br>
                        Established: 2005<br>
                        For inquiries, please contact the administration office.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 Mandaue City Sports and Cultural Complex. All rights reserved. | Reservation System</p>
    </footer>

    <form id="aspForm" runat="server"></form>
    <form id="form1"></form>
</body>
</html>