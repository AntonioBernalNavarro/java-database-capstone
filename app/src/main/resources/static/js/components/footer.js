/*
  Function to render the footer content into the page
      Select the footer element from the DOM
      Set the inner HTML of the footer element to include the footer content
  This section dynamically generates the footer content for the web page, including the hospital's logo, copyright information, and various helpful links.

  1. Insert Footer HTML Content
     * The content is inserted into the `footer` element with the ID "footer" using `footer.innerHTML`.
  2. Create the Footer Wrapper
     * The `<footer>` tag with class `footer` wraps the entire footer content.
  3. Create the Footer Container
     * Inside the footer, a container div with the class `footer-container`.
  4. Add the Hospital Logo and Copyright Info
     * A `footer-logo` div contains the logo and copyright info.
  5. Create the Links Section
     * A `footer-links` div contains all the links grouped into three sections.
  6. Add the 'Company' Links Column
  7. Add the 'Support' Links Column
  8. Add the 'Legals' Links Column
  9. Close the Footer Container
  10. Close the Footer Element
  11. Footer Rendering Complete

  Call the renderFooter function to populate the footer in the page
*/

/* 1. Define the renderFooter function */
function renderFooter() {

  /* Select the footer element from the DOM */
  const footer = document.getElementById("footer");
  if (!footer) return;

  /* 1 + 2-11. Insert Footer HTML Content (wrapper, container, logo, columns) */
  footer.innerHTML = `
    <footer class="footer">
      <div class="footer-container">

        <div class="footer-logo">
          <img src="../assets/images/logo/logo.png" alt="Hospital CMS Logo">
          <p>© Copyright 2025. All Rights Reserved by Hospital CMS.</p>
        </div>

        <div class="footer-links">

          <div class="footer-column">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>

          <div class="footer-column">
            <h4>Support</h4>
            <a href="#">Account</a>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
          </div>

          <div class="footer-column">
            <h4>Legals</h4>
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Licensing</a>
          </div>

        </div>

      </div>
    </footer>`;
}

/* Call the renderFooter function to populate the footer in the page */
renderFooter();