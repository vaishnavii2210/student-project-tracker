"use strict";

const STORAGE_KEY = "workshop-projects-v1";

const projectForm = document.getElementById("projectForm");
const projectName = document.getElementById("projectName");
const projectCategory = document.getElementById("projectCategory");
const projectStatus = document.getElementById("projectStatus");
const projectDate = document.getElementById("projectDate");
const projectDescription = document.getElementById("projectDescription");

const projectList = document.getElementById("projectList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");

const totalCount = document.getElementById("totalCount");
const progressCount = document.getElementById("progressCount");
const completedCount = document.getElementById("completedCount");

const emptyState = document.getElementById("emptyState");
const noResults = document.getElementById("noResults");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const clearButton = document.getElementById("clearButton");

let projects = [];
let editingProjectId = null;
let storageReady = false;

// Load saved projects when the page opens.
function loadProjects() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === null) {
            projects = [];
        } else {
            const parsed = JSON.parse(saved);

            if (
                !Array.isArray(parsed) ||
                !parsed.every(project =>
                    project &&
                    typeof project === "object" &&
                    !Array.isArray(project) &&
                    typeof project.id === "string" &&
                    typeof project.name === "string" &&
                    typeof project.category === "string" &&
                    typeof project.status === "string"
                )
            ) {
                throw new Error("Saved project data is not a valid project array.");
            }

            projects = parsed.map(project => ({
                ...project,
                date: String(project.date ?? ""),
                description: String(project.description ?? "")
            }));
        }

        storageReady = true;
        renderProjects();
    } catch (error) {
        storageReady = false;
        projects = [];

        console.error("Could not load saved projects:", error);

        projectList.replaceChildren();

        const message = document.createElement("p");
        message.className = "empty-state";
        message.textContent =
            "Saved projects could not be loaded. Your saved data has not been overwritten. Check the browser console or ask your instructor for help.";

        projectList.appendChild(message);

        updateStatistics();

        alert(
            "Saved projects could not be loaded. " +
            "The stored data has not been changed. " +
            "Please ask your instructor for help before continuing."
        );
    }
}

// Save the current collection in browser storage.
function saveProjects() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(projects)
        );

        return true;
    } catch (error) {
        console.error("Could not save projects:", error);

        alert(
            "Changes could not be saved in this browser. " +
            "Please check browser storage and try again."
        );

        return false;
    }
}

// Generate a unique project ID.
function createProjectId() {
    return window.crypto &&
        typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : Date.now().toString(36) +
          Math.random().toString(36).slice(2);
}

// Add a project or save changes to an existing project.
projectForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!storageReady) {
        alert(
            "Projects cannot be changed until saved data " +
            "has been loaded successfully."
        );
        return;
    }

    const name = projectName.value.trim();

    if (!name) {
        alert("Please enter a project name.");
        projectName.focus();
        return;
    }

    const projectData = {
        name: name,
        category: projectCategory.value,
        status: projectStatus.value,
        date: projectDate.value,
        description: projectDescription.value.trim()
    };

    if (editingProjectId !== null) {
        const project = projects.find(
            item => item.id === editingProjectId
        );

        if (!project) {
            alert("Project not found. Please try again.");
            resetForm();
            return;
        }

        const updatedProjects = projects.map(item =>
            item.id === editingProjectId
                ? { ...item, ...projectData }
                : item
        );

        if (!saveProjectsCollection(updatedProjects)) {
            return;
        }

        projects = updatedProjects;
    } else {
        const newProject = {
            id: createProjectId(),
            ...projectData
        };

        const updatedProjects = [...projects, newProject];

        if (!saveProjectsCollection(updatedProjects)) {
            return;
        }

        projects = updatedProjects;
    }

    resetForm();
    renderProjects();
});

// Save a proposed collection before updating the displayed collection.
function saveProjectsCollection(updatedProjects) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedProjects)
        );

        return true;
    } catch (error) {
        console.error("Could not save projects:", error);

        alert(
            "Changes could not be saved in this browser. " +
            "Your previous saved records have been kept."
        );

        return false;
    }
}

// Return the form to Add mode.
function resetForm() {
    projectForm.reset();
    editingProjectId = null;

    formTitle.textContent = "Add a Project";
    submitButton.textContent = "➕ Add Project";
    cancelEditButton.classList.add("hidden");
}

cancelEditButton.addEventListener("click", resetForm);

clearButton.addEventListener("click", function() {
    editingProjectId = null;
    formTitle.textContent = "Add a Project";
    submitButton.textContent = "➕ Add Project";
    cancelEditButton.classList.add("hidden");
});

// Edit a project.
function editProject(id) {
    const project = projects.find(item => item.id === id);

    if (!project) {
        alert("Project not found.");
        return;
    }

    editingProjectId = id;

    projectName.value = project.name;
    projectCategory.value = project.category;
    projectStatus.value = project.status;
    projectDate.value = project.date;
    projectDescription.value = project.description;

    formTitle.textContent = "Edit Project";
    submitButton.textContent = "💾 Save Changes";
    cancelEditButton.classList.remove("hidden");

    document.getElementById("formPanel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    projectName.focus();
}

// Delete a project after confirmation.
function deleteProject(id) {
    if (!storageReady) {
        alert("Saved projects could not be loaded. Deletion is disabled.");
        return;
    }

    const project = projects.find(item => item.id === id);

    if (!project) {
        alert("Project not found.");
        return;
    }

    const confirmed = window.confirm(
        'Are you sure you want to delete "' + project.name + '"?'
    );

    if (!confirmed) {
        return;
    }

    const updatedProjects = projects.filter(
        item => item.id !== id
    );

    if (!saveProjectsCollection(updatedProjects)) {
        return;
    }

    projects = updatedProjects;

    if (editingProjectId === id) {
        resetForm();
    }

    renderProjects();
}

// Format a date.
function formatDate(value) {
    if (!value) {
        return "No target date";
    }

    const parts = value.split("-");

    if (parts.length !== 3) {
        return "No target date";
    }

    return parts[2] + "/" + parts[1] + "/" + parts[0];
}

// Update the statistics.
function updateStatistics() {
    totalCount.textContent = projects.length;

    progressCount.textContent = projects.filter(
        project => project.status === "In Progress"
    ).length;

    completedCount.textContent = projects.filter(
        project => project.status === "Completed"
    ).length;
}

// Search and filter projects.
function getFilteredProjects() {
    const term = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedCategory = categoryFilter.value;

    return projects.filter(project => {
        const searchableText = [
            project.name,
            project.category,
            project.status,
            project.description
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(term);

        const matchesStatus =
            selectedStatus === "All" ||
            selectedStatus === "" ||
            project.status === selectedStatus;

        const matchesCategory =
            selectedCategory === "All" ||
            selectedCategory === "" ||
            project.category === selectedCategory;

        return matchesSearch && matchesStatus && matchesCategory;
    });
}

// Create elements safely using textContent.
function createTextElement(tagName, text, className) {
    const element = document.createElement(tagName);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

// Display project cards.
function renderProjects() {
    updateStatistics();

    const filteredProjects = getFilteredProjects();

    projectList.replaceChildren();

    emptyState.classList.add("hidden");
    noResults.classList.add("hidden");

    if (projects.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }

    if (filteredProjects.length === 0) {
        noResults.classList.remove("hidden");
        return;
    }

    filteredProjects.forEach(function(project) {
        const card = document.createElement("article");
        card.className = "project-card";

        let statusClass = "status-not-started";

        if (project.status === "In Progress") {
            statusClass = "status-in-progress";
        } else if (project.status === "Completed") {
            statusClass = "status-completed";
        }

        card.appendChild(
            createTextElement("h3", "📘 " + project.name)
        );

        card.appendChild(
            createTextElement(
                "p",
                project.description || "A new project ready to begin.",
                "project-description"
            )
        );

        const badges = document.createElement("div");
        badges.className = "badges";

        badges.appendChild(
            createTextElement(
                "span",
                project.status,
                "badge " + statusClass
            )
        );

        badges.appendChild(
            createTextElement(
                "span",
                project.category,
                "badge category-badge"
            )
        );

        card.appendChild(badges);

        const footer = document.createElement("div");
        footer.className = "project-footer";

        footer.appendChild(
            createTextElement(
                "span",
                "📅 " + formatDate(project.date),
                "project-date"
            )
        );

        const actions = document.createElement("div");
        actions.className = "project-actions";

        const editButton = createTextElement(
            "button",
            "✏️ Edit",
            "btn btn-edit"
        );

        editButton.type = "button";

        editButton.addEventListener("click", function() {
            editProject(project.id);
        });

        const deleteButton = createTextElement(
            "button",
            "🗑️ Delete",
            "btn btn-delete"
        );

        deleteButton.type = "button";

        deleteButton.addEventListener("click", function() {
            deleteProject(project.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        footer.appendChild(actions);
        card.appendChild(footer);
        projectList.appendChild(card);
    });
}

// Update the display when searching or filtering.
searchInput.addEventListener("input", renderProjects);
statusFilter.addEventListener("change", renderProjects);
categoryFilter.addEventListener("change", renderProjects);

// Start the application.
loadProjects();