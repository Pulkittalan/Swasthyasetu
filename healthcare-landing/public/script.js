let currentSlide = 0;

function autoSlide() {
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;

  // Update the current slide index
  currentSlide = (currentSlide + 1) % totalSlides;

  // Apply the transform to the slide container
  const slideContainer = document.querySelector('.slide-container');
  slideContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Set the interval for automatic sliding
setInterval(autoSlide, 1500); // Slides every 3 seconds

function openSignInPopup() {
  var popup = window.open('http://localhost:3000/auth/google', 'Google Sign In', 'width=500,height=500');

  // Listen for a message indicating the sign-in is successful
  window.addEventListener('message', function(event) {
    if (event.data === 'signed-in') {
      // Close the popup when the user is signed in successfully
      popup.close();
      alert('Sign-in successful!');
    }
  });
}function callEmergency() {
  // Change the number as per country requirement
  window.location.href = "tel:112"; // General emergency number
}