// Theme Toggle Functionality
const themeToggle = document.getElementById("theme-toggle")
const html = document.documentElement

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem("theme") || "light"
if (currentTheme === "dark") {
  html.classList.add("dark")
}

themeToggle.addEventListener("click", () => {
  html.classList.toggle("dark")
  const theme = html.classList.contains("dark") ? "dark" : "light"
  localStorage.setItem("theme", theme)
})

// Portfolio Projects Data
// ⚠️ ADICIONE SEUS PROJETOS AQUI
const projects = [
  {
    title: "SportStore - E-commerce",
    description: "E-commerce completo com carrinho, checkout e 3 formas de pagamento. 100% JavaScript puro.",
    tags: ["HTML", "CSS", "JavaScript", "LocalStorage"],
    githubUrl: "https://github.com/BragaDudu/SportStore",
  },
  {
    title: "FluentGo",
    description: "Plataforma de tradução de idiomas com reconhecimento de voz e variedade de linguas.",
    tags: ["JavaScript", "Web Speech API", "CSS"],
    githubUrl: "https://github.com/BragaDudu/FluentGO",
  },
  {
    title: "API Weather",
    description: "Gerenciador de tarefas com drag and drop e filtros avançados.",
    tags: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/BragaDudu/API-Weather",
  },
  {
    title: "Portfolio Pessoal",
    description: "Site portfolio profissional com tema dark/light e design responsivo.",
    tags: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/BragaDudu/portfolio",
  },
  {
    title: "Primeiro CRUD",
    description: "Plataforma simples, com CRUD integrado.",
    tags: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/BragaDudu/Primeiro-Crud",
  },
]

// Render Projects
const projectsGrid = document.querySelector(".projects-grid")

projects.forEach((project) => {
  const projectCard = document.createElement("div")
  projectCard.className = "project-card"

  projectCard.innerHTML = `
    <div class="project-header">
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.description}</p>
    </div>
    <div class="project-content">
      <div class="project-tags">
        ${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
          <path d="M9 18c-4.51 2-5-2-7-2"></path>
        </svg>
        Ver no GitHub
      </a>
    </div>
  `

  projectsGrid.appendChild(projectCard)
})

// Smooth scroll for anchor links (if needed in future)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})
