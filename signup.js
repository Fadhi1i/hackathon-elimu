document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent page reload

    // Get form data
    const full_name = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const mobile_number = document.getElementById("mobile_number").value.trim();
    const no_of_children = parseInt(
      document.getElementById("childrenCount").value
    );

    // Collect children names and grades into array
    const children = [];
    document.querySelectorAll(".child-entry").forEach((childDiv) => {
      const childName = childDiv.querySelector("input[name^='childName']").value.trim();
      const childGrade = childDiv.querySelector("input[name^='childGrade']").value.trim();
      if (childName && childGrade) {
        children.push({ name: childName, grade: childGrade });
      }
    });

    // Basic validation
    if (!full_name || !email || !password || !mobile_number) {
      alert("All fields are required!");
      return;
    }

    try {
      // Send data to Flask backend
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: full_name,
          email,
          password,
          mobile_number,
          no_of_children,
          children,
        }),
      });

      // Safely parse JSON, catch invalid JSON
      let data;
      try {
        data = await response.json();
      } catch (err) {
        data = { success: false, message: "Invalid server response" };
      }

      // Handle HTTP or API errors
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      console.log("Signup success:", data);
      alert("Signup successful!");
      signupForm.reset(); // Clear the form

      // Redirect to login page
      window.location.href = "login.html";
    } catch (error) {
      console.error("Signup failed:", error);
      //alert("Signup failed: " + error.message);
      signupForm.reset(); // Clear the form
    }
  });
});
