// Toggle sidebar on mobile
document.getElementById('menu-toggle').addEventListener('click', function() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('collapsed');
});

// Initialize the competency radar chart for CBC
function initCompetencyRadar() {
  const ctx = document.getElementById('competencyRadar').getContext('2d');
  const radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        'Communication & Collaboration', 
        'Critical Thinking', 
        'Creativity & Imagination', 
        'Citizenship', 
        'Digital Literacy',
        'Learning to Learn',
        'Self-Efficacy'
      ],
      datasets: [{
        label: 'Competency Development',
        data: [85, 72, 90, 68, 78, 82, 75],
        backgroundColor: 'rgba(78, 84, 200, 0.2)',
        borderColor: 'rgba(78, 84, 200, 1)',
        pointBackgroundColor: 'rgba(78, 84, 200, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(78, 84, 200, 1)'
      }]
    },
    options: {
      elements: {
        line: {
          tension: 0.2
        }
      },
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
        }
      }
    }
  });
}

// Fetch user data when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the competency radar chart
  initCompetencyRadar();
  
  // Check if we're coming from a successful login
  const urlParams = new URLSearchParams(window.location.search);
  const fromLogin = urlParams.get('fromLogin');
  
  if (fromLogin) {
    // If we just logged in, give the server a moment to establish the session
    setTimeout(() => {
      fetchUserData();
    }, 500);
  } else {
    fetchUserData();
  }
});

// Fetch user data from the API
async function fetchUserData() {
  try {
    console.log("Fetching user data from dashboard API...");
    const response = await fetch('http://127.0.0.1:5000/api/dashboard', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log("Dashboard API response status:", response.status);
    
    const data = await response.json();
    console.log("Dashboard API response data:", data);
    
    if (data.success) {
      displayUserData(data.data);
    } else {
      console.error('Failed to fetch user data:', data.message);
      if (response.status === 401) {
        console.log("Unauthorized, redirecting to login page");
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    // For demo purposes, we'll use mock data if the API fails
    displayMockData();
  }
}

// Display mock data if API is not available
function displayMockData() {
  const mockData = {
    user: {
      username: "Jane",
      email: "jane@example.com"
    },
    children: [
      {
        name: "Wanjiku",
        grade: "6"
      }
    ]
  };
  displayUserData(mockData);
}

// Display user data in the dashboard
function displayUserData(userData) {
  // Update the UI with user-specific data
  document.getElementById('welcomeMessage').textContent = `Karibu, ${userData.user.username}!`;
  document.getElementById('userEmail').textContent = userData.user.email;
  document.getElementById('dashboardWelcome').textContent = `Karibu to ELIMU Bora, ${userData.user.username}!`;
  
  // Update children information
  if (userData.children && userData.children.length > 0) {
    document.getElementById('child1Name').textContent = userData.children[0].name;
    
    if (userData.children.length > 1) {
      document.getElementById('child2Card').style.display = 'flex';
      document.getElementById('child2Name').textContent = userData.children[1].name;
    }
  }
}

// Show upgrade modal
function showUpgradeOptions() {
  document.getElementById('upgradeModal').style.display = 'flex';
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Logout function
async function logout() {
  try {
    const response = await fetch('http://127.0.0.1:5000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    const data = await response.json();
    if (data.success) {
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Close modal if clicked outside
window.onclick = function(event) {
  const modals = document.getElementsByClassName('modal');
  for (let i = 0; i < modals.length; i++) {
    if (event.target == modals[i]) {
      modals[i].style.display = 'none';
    }
  }
}