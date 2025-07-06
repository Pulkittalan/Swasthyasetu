const apiBase = "http://localhost:3000";

// Handle Doctor Login button click
document.getElementById('doctor-login-btn').addEventListener('click', function() {
    showForm('doctor-login');
});

// Handle Hospital Login button click
document.getElementById('hospital-login-btn').addEventListener('click', function() {
    showForm('hospital-login');
});

// Show the appropriate login or registration form
function showForm(type) {
    // Hide all forms initially
    document.getElementById('doctor-login-form').style.display = 'none';
    document.getElementById('hospital-login-form').style.display = 'none';
    document.getElementById('doctor-registration-form').style.display = 'none';
    document.getElementById('hospital-registration-form').style.display = 'none';

    // Show the appropriate form based on the 'type'
    if (type === 'doctor-login') {
        document.getElementById('doctor-login-form').style.display = 'block';
    } else if (type === 'hospital-login') {
        document.getElementById('hospital-login-form').style.display = 'block';
    } else if (type === 'doctor-registration') {
        document.getElementById('doctor-registration-form').style.display = 'block';
    } else if (type === 'hospital-registration') {
        document.getElementById('hospital-registration-form').style.display = 'block';
    }
}

// Handle Doctor Registration button click
document.getElementById('doctor-register-btn').addEventListener('click', function() {
    showForm('doctor-registration');
});

// Handle Hospital Registration button click
document.getElementById('hospital-register-btn').addEventListener('click', function() {
    showForm('hospital-registration');
});

// Back to Doctor Login from Registration
document.getElementById('back-to-doctor-login').addEventListener('click', function() {
    showForm('doctor-login');
});

// Back to Hospital Login from Registration
document.getElementById('back-to-hospital-login').addEventListener('click', function() {
    showForm('hospital-login');
});

// ** Doctor Registration **
document.querySelector("#doctor-registration-form .register-btn").addEventListener("click", async () => {
    const doctor_id = document.getElementById("new-doctor-id").value;
    const password = document.getElementById("new-doctor-password").value;
    const email = document.getElementById("doctor-email").value;
    const doctor_name = document.getElementById("doctor-name").value;
    const doctor_special = document.getElementById("doctor-specialization").value;

    const response = await fetch(`${apiBase}/register/doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            doctor_id, password, email, doctor_name, doctor_special
        })
    });

    const data = await response.json();
    alert(data.message);
});

// ** Hospital Registration (Fixed) **
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#hospital-registration-form .register-btn").addEventListener("click", async () => {
        const hospital_id = document.getElementById("new-hospital-id").value.trim();
        const password = document.getElementById("new-hospital-password").value.trim();
        const email = document.getElementById("hospital-email").value.trim();
        const hospital_name = document.getElementById("hospital-name").value.trim();
        const hospital_address = document.getElementById("hospital-address").value.trim();
        const hospital_contact = document.getElementById("hospital-contact").value.trim();

        if (!hospital_id || !password || !email || !hospital_name || !hospital_address || !hospital_contact) {
            alert("All fields are required.");
            return;
        }

        try {
            const response = await fetch(`${apiBase}/register/hospital`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hospital_id, password, email, hospital_name, hospital_address, hospital_contact })
            });

            const data = await response.json();
            if (response.ok) {
                alert("Hospital registered successfully!");
            } else {
                alert(`Error: ${data.error || "Registration failed"}`);
            }
        } catch (error) {
            alert("Network error. Please try again.");
        }
    });
});



// ** Doctor Login **
document.querySelector("#doctor-login-form .login-btn").addEventListener("click", async () => {
    const doctor_id = document.getElementById("doctor-id").value;
    const password = document.getElementById("doctor-password").value;

    const response = await fetch(`${apiBase}/login/doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id, password })
    });

    const data = await response.json();
    if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Doctor Login Successful");
        window.location.href = "/telemedicine/doctor/doctor.html";
    } else {
        alert(data.error);
    }
});

// ** Hospital Login **
document.querySelector("#hospital-login-form .login-btn").addEventListener("click", async () => {
    
    const hospital_id = document.getElementById("hospital-id").value;
    const password = document.getElementById("hospital-password").value;

    const response = await fetch(`${apiBase}/login/hospital`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital_id, password })
    });

    const data = await response.json();
    if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Hospital Login Successful");
        // Retrieve hospital ID or any unique identifier from the response
        const hospitalId = data.hospitalId; // Ensure this is sent from your backend

                // Validate that hospitalId is not empty or undefined
        if (hospitalId) {
            // Redirect to the unique dashboard
            window.location.href = `http://localhost:3000/dashboard/${hospitalId}`;
        } else {
            alert("Invalid hospital ID");
        }
        
    } else {
        alert(data.error);
    }
});

// Toggle password visibility
document.getElementById('toggle-doctor-password').addEventListener('click', function() {
    const passwordField = document.getElementById('new-doctor-password');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;

    // Change eye icon
    this.innerText = type === 'text' ? '👁️' : '🙈';
});

// Function to check password strength
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('password-strength');
    const strengthText = document.getElementById('password-strength-text');
    const strength = calculatePasswordStrength(password);
    
    // Reset previous classes
    strengthIndicator.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');

    if (strength === 0) {
        strengthIndicator.style.background = "lightgray";
        strengthText.innerText = "Enter password";
        strengthText.style.color = "black";
    } else if (strength < 3) {
        strengthIndicator.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.innerText = "Weak";
    } else if (strength < 5) {
        strengthIndicator.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.innerText = "Medium";
    } else {
        strengthIndicator.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.innerText = "Strong";
    }
}

// Function to calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    return strength;
}

// Add event listener to monitor password input and update strength
document.getElementById('new-doctor-password').addEventListener('input', function() {
    checkPasswordStrength(this.value);
});


