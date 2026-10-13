const projectForm = document.getElementById("projectForm");
const nameInput = document.getElementById("projectName");
const statusInput = document.getElementById("status");
const projectList = document.getElementById("projectList");

const projects = [];

function renderProjects() {
    projectList.innerHTML = "";

    if (projects.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No projects added yet.";
        projectList.appendChild(emptyMessage);
        return;
    }

    projects.forEach(function (project) {
        const listItem = document.createElement("article");
        listItem.className = "project-card";

        const projectTitle = document.createElement("h3");
        projectTitle.textContent = project.name;

        const projectStatus = document.createElement("p");
        projectStatus.textContent = "Status: " + project.status;

        listItem.appendChild(projectTitle);
        listItem.appendChild(projectStatus);

        projectList.appendChild(listItem);
    });
}

projectForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const projectName = nameInput.value.trim();
    const projectStatus = statusInput.value;

    if (projectName === "") {
        alert("Please enter a project name.");
        return;
    }

    const project = {
        id: crypto.randomUUID(),
        name: projectName,
        status: projectStatus
    };

    projects.push(project);

    renderProjects();

    projectForm.reset();
});

renderProjects();