
const projectForm = document.getElementById("project-form");
const nameInput = document.getElementById("name");
const statusInput = document.getElementById("status");
const projectList = document.getElementById("project-list");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");

projectForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const projectName = nameInput.value.trim();
    const projectStatus = statusInput.value;

    if (projectName === "") {
        message.textContent = "Please enter a project name.";
        return;
    }

    const listItem = document.createElement("li");
    const projectTitle = document.createElement("strong");
    const projectDetails = document.createElement("span");

    projectTitle.textContent = projectName;
    projectDetails.textContent = " — " + projectStatus;

    listItem.appendChild(projectTitle);
    listItem.appendChild(projectDetails);
    projectList.appendChild(listItem);

    emptyState.hidden = true;
    message.textContent = "Project added successfully!";

    projectForm.reset();
});