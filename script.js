<<<<<<< HEAD
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".menu-bar a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.clientHeight;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }
  });
});
=======
const hamburger = document.querySelector(".hamburger");
const menu_bar = document.querySelector(".navbar-menu .menu-bar");

if (hamburger && menu_bar) {
  hamburger.addEventListener("click", () => {
    menu_bar.classList.toggle("show");
  });

  document.querySelectorAll(".navbar-menu .menu-bar a").forEach(link => {
    link.addEventListener("click", () => {
      menu_bar.classList.remove("show");
    });
  });
}
>>>>>>> 80b18ed559e1167c80b9104494f7a02536c75f73
