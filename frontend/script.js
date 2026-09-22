// ============================================================
// TerraMind AI - Complete Frontend JavaScript
// ============================================================

const API_URL = "http://127.0.0.1:8000";


// ============================================================
// ENVIRONMENTAL ANALYSIS
// ============================================================

async function analyzeEnvironment() {

    const soilOrganicCarbon =
        parseFloat(document.getElementById("soilOrganicCarbon").value);

    const soilPh =
        parseFloat(document.getElementById("soilPh").value);

    const rainfall =
        document.getElementById("rainfall").value;

    const temperature =
        parseFloat(document.getElementById("temperature").value);

    const crop =
        document.getElementById("crop").value;

    const landUse =
        document.getElementById("landUse").value;


    // Validate inputs

    if (
        isNaN(soilOrganicCarbon) ||
        isNaN(soilPh) ||
        isNaN(temperature) ||
        !rainfall ||
        !crop ||
        !landUse
    ) {
        alert("Please fill in all environmental fields.");
        return;
    }


    // Get UI elements

    const loading =
        document.getElementById("loading");

    const results =
        document.getElementById("results");

    const analyzeButton =
        document.getElementById("analyzeButton");


    // Show loading

    if (loading) {
        loading.classList.remove("hidden");
    }

    if (results) {
        results.classList.add("hidden");
    }

    if (analyzeButton) {
        analyzeButton.disabled = true;
    }


    try {

        const response = await fetch(
            `${API_URL}/analyze`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    soil_organic_carbon:
                        soilOrganicCarbon,

                    soil_ph:
                        soilPh,

                    rainfall:
                        rainfall,

                    temperature:
                        temperature,

                    crop:
                        crop,

                    land_use:
                        landUse
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail || "Environmental analysis failed."
            );

        }


        // Display results

        displayAnalysisResults(data);


        if (results) {
            results.classList.remove("hidden");
        }


        // Scroll to results

        if (results) {

            results.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


    } catch (error) {

        console.error(
            "Environmental analysis error:",
            error
        );

        alert(
            "Unable to connect to TerraMind AI backend."
        );

    } finally {

        if (loading) {
            loading.classList.add("hidden");
        }

        if (analyzeButton) {
            analyzeButton.disabled = false;
        }

    }
}


// ============================================================
// DISPLAY ENVIRONMENTAL ANALYSIS RESULTS
// ============================================================

function displayAnalysisResults(data) {

    const risksContainer =
        document.getElementById("risks");

    const recommendationContainer =
        document.getElementById("recommendation");

    const metricsContainer =
        document.getElementById("metrics");

    const evidenceContainer =
        document.getElementById("evidence");


    // --------------------------------------------------------
    // RISKS
    // --------------------------------------------------------

    if (risksContainer) {

        risksContainer.innerHTML = "";

        const risks =
            data.identified_risks || [];


        if (risks.length === 0) {

            risksContainer.innerHTML = `
                <div class="risk">
                    No major environmental risks were detected
                    from the submitted conditions.
                </div>
            `;

        } else {

            risks.forEach(function (risk) {

                const riskElement =
                    document.createElement("div");

                riskElement.className = "risk";

                riskElement.textContent = risk;

                risksContainer.appendChild(
                    riskElement
                );

            });

        }

    }


    // --------------------------------------------------------
    // RECOMMENDATION
    // --------------------------------------------------------

    if (recommendationContainer) {

        recommendationContainer.innerHTML = "";

        const recommendations =
            data.recommendations || [];


        if (recommendations.length === 0) {

            recommendationContainer.innerHTML = `
                <p>
                    No specific recommendation was generated
                    for the submitted conditions.
                </p>
            `;

        } else {

            recommendations.forEach(
                function (recommendation) {

                    const recommendationBox =
                        document.createElement("div");

                    recommendationBox.className =
                        "recommendation";


                    recommendationBox.innerHTML = `

                        <h4>Recommended Action</h4>

                        <p>
                            <strong>
                                ${escapeHtml(
                        recommendation.action || ""
                    )}
                            </strong>
                        </p>

                        <h4>Why it works</h4>

                        <p>
                            ${escapeHtml(
                        recommendation.why || ""
                    )}
                        </p>

                        <h4>Time Horizon</h4>

                        <p>
                            ${escapeHtml(
                        recommendation.time_horizon || ""
                    )}
                        </p>

                        <h4>Confidence</h4>

                        <p>
                            ${escapeHtml(
                        recommendation.confidence || ""
                    )}
                        </p>

                        <h4>Scientific Basis</h4>

                        <p>
                            ${escapeHtml(
                        recommendation.scientific_basis || ""
                    )}
                        </p>

                        <p>
                            <strong>Source:</strong>
                            ${escapeHtml(
                        recommendation.source || ""
                    )}
                        </p>

                    `;


                    recommendationContainer.appendChild(
                        recommendationBox
                    );

                }
            );

        }

    }


    // --------------------------------------------------------
    // IMPACTED METRICS
    // --------------------------------------------------------

    if (metricsContainer) {

        metricsContainer.innerHTML = "";

        const recommendations =
            data.recommendations || [];


        const allMetrics = [];


        recommendations.forEach(
            function (recommendation) {

                const metrics =
                    recommendation.impacted_metrics || [];


                metrics.forEach(
                    function (metric) {

                        if (
                            !allMetrics.includes(metric)
                        ) {

                            allMetrics.push(metric);

                        }

                    }
                );

            }
        );


        if (allMetrics.length === 0) {

            metricsContainer.innerHTML = `
                <p>No impacted metrics available.</p>
            `;

        } else {

            allMetrics.forEach(
                function (metric) {

                    const metricElement =
                        document.createElement("span");

                    metricElement.className =
                        "metric";

                    metricElement.textContent =
                        metric;

                    metricsContainer.appendChild(
                        metricElement
                    );

                }
            );

        }

    }


    // --------------------------------------------------------
    // SCIENTIFIC EVIDENCE
    // --------------------------------------------------------

    if (evidenceContainer) {

        evidenceContainer.innerHTML = "";

        const evidence =
            data.retrieved_knowledge || [];


        if (evidence.length === 0) {

            evidenceContainer.innerHTML = `
                <p>
                    No retrieved scientific evidence was returned.
                </p>
            `;

        } else {

            evidence.forEach(
                function (item, index) {

                    const evidenceBox =
                        document.createElement("div");

                    evidenceBox.className =
                        "evidence";


                    evidenceBox.innerHTML = `

                        <h4>
                            Evidence ${index + 1}
                        </h4>

                        <p>
                            ${escapeHtml(
                        item.evidence || ""
                    )}
                        </p>

                    `;


                    evidenceContainer.appendChild(
                        evidenceBox
                    );

                }
            );

        }

    }

}


// ============================================================
// CHATBOT
// ============================================================

async function sendChatMessage() {

    const input =
        document.getElementById("chatInput");

    const messages =
        document.getElementById("chatMessages");


    if (!input || !messages) {
        return;
    }


    const question =
        input.value.trim();


    if (!question) {

        alert("Please enter a question.");

        return;
    }


    // Display user message

    addChatMessage(
        "user",
        question
    );


    // Clear input

    input.value = "";


    // Display temporary loading message

    const loadingMessage =
        document.createElement("div");

    loadingMessage.className =
        "chat-message bot";

    loadingMessage.innerHTML = `
        <strong>TerraMind AI</strong>
        <p>Analyzing environmental knowledge...</p>
    `;

    messages.appendChild(
        loadingMessage
    );


    messages.scrollTop =
        messages.scrollHeight;


    try {

        const response =
            await fetch(
                `${API_URL}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question: question
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Chat request failed."
            );

        }


        // Remove loading message

        loadingMessage.remove();


        // Display AI response

        addChatMessage(
            "bot",
            data.answer || "No answer received."
        );


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        loadingMessage.remove();


        addChatMessage(
            "bot",
            "Sorry, I could not connect to the TerraMind AI backend."
        );

    }

}


// ============================================================
// ADD CHAT MESSAGE
// ============================================================

function addChatMessage(
    sender,
    message
) {

    const messages =
        document.getElementById("chatMessages");


    if (!messages) {
        return;
    }


    const messageElement =
        document.createElement("div");


    messageElement.className =
        sender === "user"
            ? "chat-message user"
            : "chat-message bot";


    const title =
        sender === "user"
            ? "You"
            : "TerraMind AI";


    messageElement.innerHTML = `

        <strong>
            ${title}
        </strong>

        <p>
            ${formatChatMessage(message)}
        </p>

    `;


    messages.appendChild(
        messageElement
    );


    messages.scrollTop =
        messages.scrollHeight;

}


// ============================================================
// FORMAT CHAT RESPONSE
// ============================================================

function formatChatMessage(message) {

    if (!message) {
        return "";
    }


    return escapeHtml(message)
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>");
}


// ============================================================
// LOGIN
// ============================================================

async function loginUser() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    if (!email || !password) {

        alert(
            "Please enter your email and password."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email: email,

                        password: password

                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.detail ||
                "Login failed."
            );

            return;
        }


        // Save logged-in user

        localStorage.setItem(
            "terramindUser",
            JSON.stringify(result)
        );

        // Go to dashboard page
        window.location.href = "dashboard.html";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Cannot connect to TerraMind AI server."
        );

    }

}


// ============================================================
// REGISTER / CREATE ACCOUNT
// ============================================================

async function registerUser() {

    const username =
        document.getElementById(
            "registerUsername"
        ).value.trim();


    const email =
        document.getElementById(
            "registerEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "registerPassword"
        ).value;


    if (!username || !email || !password) {

        alert(
            "Please fill in all fields."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        username: username,

                        email: email,

                        password: password

                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.detail ||
                "Registration failed."
            );

            return;
        }


        alert(
            "Account created successfully!"
        );


        // Clear registration form

        document.getElementById(
            "registerUsername"
        ).value = "";


        document.getElementById(
            "registerEmail"
        ).value = "";


        document.getElementById(
            "registerPassword"
        ).value = "";


        // Go to login

        showLogin();


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        alert(
            "Cannot connect to TerraMind AI server."
        );

    }

}


// ============================================================
// SHOW LOGIN
// ============================================================

function showLogin() {

    const loginCard =
        document.getElementById(
            "loginCard"
        );

    const registerCard =
        document.getElementById(
            "registerCard"
        );

    const dashboard =
        document.getElementById(
            "dashboardSection"
        );


    if (loginCard) {
        loginCard.classList.remove("hidden");
    }


    if (registerCard) {
        registerCard.classList.add("hidden");
    }


    if (dashboard) {
        dashboard.classList.add("hidden");
    }

}


// ============================================================
// SHOW REGISTER
// ============================================================

function showRegister() {

    const loginCard =
        document.getElementById(
            "loginCard"
        );

    const registerCard =
        document.getElementById(
            "registerCard"
        );

    const dashboard =
        document.getElementById(
            "dashboardSection"
        );


    if (loginCard) {
        loginCard.classList.add("hidden");
    }


    if (registerCard) {
        registerCard.classList.remove("hidden");
    }


    if (dashboard) {
        dashboard.classList.add("hidden");
    }

}


// ============================================================
// SHOW USER DASHBOARD
// ============================================================

function showDashboard(user) {

    const loginCard =
        document.getElementById(
            "loginCard"
        );

    const registerCard =
        document.getElementById(
            "registerCard"
        );

    const dashboard =
        document.getElementById(
            "dashboardSection"
        );


    // Hide login

    if (loginCard) {
        loginCard.classList.add("hidden");
    }


    // Hide register

    if (registerCard) {
        registerCard.classList.add("hidden");
    }


    // Show dashboard

    if (dashboard) {
        dashboard.classList.remove("hidden");
    }


    // Display username

    const usernameElement =
        document.getElementById(
            "dashboardUsername"
        );


    if (usernameElement) {

        usernameElement.textContent =
            user.username || "User";

    }


    // Display email

    const emailElement =
        document.getElementById(
            "dashboardEmail"
        );


    if (emailElement) {

        emailElement.textContent =
            user.email || "";

    }

}


// ============================================================
// LOGOUT
// ============================================================

function logoutUser() {
    function logoutUser() {
        localStorage.removeItem("terramindUser");

        window.location.href = "index.html";
    }

    // Remove saved user

    localStorage.removeItem(
        "terramindUser"
    );


    // Hide dashboard

    const dashboard =
        document.getElementById(
            "dashboardSection"
        );


    if (dashboard) {
        dashboard.classList.add("hidden");
    }


    // Show login

    const loginCard =
        document.getElementById(
            "loginCard"
        );


    if (loginCard) {
        loginCard.classList.remove("hidden");
    }


    // Clear login fields

    const email =
        document.getElementById(
            "loginEmail"
        );


    const password =
        document.getElementById(
            "loginPassword"
        );


    if (email) {
        email.value = "";
    }


    if (password) {
        password.value = "";
    }


    alert(
        "You have been logged out."
    );

}


// ============================================================
// CHECK USER WHEN PAGE LOADS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const savedUser =
            localStorage.getItem(
                "terramindUser"
            );


        if (savedUser) {

            try {

                const user =
                    JSON.parse(savedUser);

                showDashboard(user);

            } catch (error) {

                console.error(
                    "Saved user data error:",
                    error
                );

                localStorage.removeItem(
                    "terramindUser"
                );

                showLogin();

            }

        } else {

            showLogin();

        }

    }
);


// ============================================================
// ENTER KEY FOR CHAT
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const chatInput =
            document.getElementById(
                "chatInput"
            );


        if (chatInput) {

            chatInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        sendChatMessage();

                    }

                }
            );

        }

    }
);


// ============================================================
// HTML ESCAPE
// Prevents HTML injection in API responses
// ============================================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}
async function saveAssessment() {

    const savedUser = JSON.parse(
        localStorage.getItem("terramindUser")
    );

    const userId = savedUser?.user_id;

    if (!userId) {
        alert("Please login first.");
        return;
    }

    const data = {
        user_id: Number(userId),

        soil_organic_carbon:
            document.getElementById("soilOrganicCarbon").value,

        soil_ph:
            document.getElementById("soilPh").value,

        rainfall:
            document.getElementById("rainfall").value,

        temperature:
            document.getElementById("temperature").value,

        crop:
            document.getElementById("crop").value,

        land_use:
            document.getElementById("landUse").value,

        recommendation:
            document.getElementById("recommendation").innerText,

        impacted_metrics:
            document.getElementById("metrics").innerText,

        risks:
            document.getElementById("risks").innerText
    };

    try {

        const response = await fetch(
            `${API_URL}/assessments`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.detail || "Failed to save assessment.");
            return;
        }

        alert("✅ Assessment saved successfully!");

    } catch (error) {

        console.error(error);

        alert("Server connection error.");
    }
}
// ===============================
// PAGE NAVIGATION & AUTH CHECK
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const userId = localStorage.getItem("userId");

    const currentPage =
        window.location.pathname.split("/").pop();

    if (currentPage === "dashboard.html") {

        const username =
            localStorage.getItem("username");

        const email =
            localStorage.getItem("email");

        const usernameElement =
            document.getElementById("dashboardUsername");

        const emailElement =
            document.getElementById("dashboardEmail");

        if (usernameElement && username) {
            usernameElement.textContent = username;
        }

        if (emailElement && email) {
            emailElement.textContent = email;
        }
    }

    if (currentPage === "assessments.html") {

        if (!userId) {
            window.location.href = "index.html";
            return;
        }

        loadSavedAssessments();
    }

});
// ===============================
// DASHBOARD PAGE
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const currentPage =
        window.location.pathname.split("/").pop();

    if (currentPage !== "dashboard.html") {
        return;
    }

    const savedUser =
        localStorage.getItem("terramindUser");

    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }

    try {
        const user = JSON.parse(savedUser);

        const usernameElement =
            document.getElementById("dashboardUsername");

        const emailElement =
            document.getElementById("dashboardEmail");

        if (usernameElement) {
            usernameElement.textContent =
                user.username;
        }

        if (emailElement) {
            emailElement.textContent =
                user.email;
        }

    } catch (error) {
        console.error(
            "User data error:",
            error
        );

        localStorage.removeItem("terramindUser");
        window.location.href = "index.html";
    }
});
// ===============================
// ANALYSIS PAGE AUTH CHECK
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const currentPage =
        window.location.pathname.split("/").pop();

    if (currentPage !== "analysis.html") {
        return;
    }

    const savedUser =
        localStorage.getItem("terramindUser");

    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }
});
// ===============================
// CHATBOT PAGE AUTH CHECK
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const currentPage =
        window.location.pathname.split("/").pop();

    if (currentPage !== "chatbot.html") {
        return;
    }

    const savedUser =
        localStorage.getItem("terramindUser");

    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }
});
// ===============================
// ASSESSMENTS PAGE AUTH CHECK
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const currentPage =
        window.location.pathname.split("/").pop();

    if (currentPage !== "assessments.html") {
        return;
    }

    const savedUser =
        localStorage.getItem("terramindUser");

    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }

});
// ===============================
// LOAD SAVED ASSESSMENTS
// ===============================

async function loadSavedAssessments() {

    const savedUser =
        localStorage.getItem("terramindUser");

    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }

    const user = JSON.parse(savedUser);
    const userId = user.user_id;

    try {

        const response = await fetch(
            `${API_URL}/assessments/${userId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load assessments");
        }

        const assessments =
            await response.json();

        const list =
            document.getElementById("assessmentList");

        const total =
            document.getElementById("assessmentTotal");

        if (!list) return;

        total.textContent =
            `${assessments.length} assessment${assessments.length !== 1 ? "s" : ""}`;

        if (assessments.length === 0) {
            list.innerHTML = `
                <div class="empty-assessments">
                    <div class="empty-icon">🌱</div>
                    <h3>No saved assessments</h3>
                    <p>Your environmental assessments will appear here.</p>
                    <a href="analysis.html">
                        Create your first assessment →
                    </a>
                </div>
            `;
            return;
        }

        list.innerHTML = assessments.map(
            (assessment) => `
                <div class="assessment-card">

                    <h3>🌿 Assessment #${assessment.id}</h3>

                    <p>
                        <strong>Soil Organic Carbon:</strong>
                        ${assessment.soil_organic_carbon}
                    </p>

                    <p>
                        <strong>Soil pH:</strong>
                        ${assessment.soil_ph}
                    </p>

                    <p>
                        <strong>Rainfall:</strong>
                        ${assessment.rainfall}
                    </p>

                    <p>
                        <strong>Temperature:</strong>
                        ${assessment.temperature}
                    </p>

                    <p>
                        <strong>Crop:</strong>
                        ${assessment.crop}
                    </p>

                    <p>
                        <strong>Land Use:</strong>
                        ${assessment.land_use}
                    </p>

                    <hr>

                    <p>
                        <strong>Recommendation:</strong>
                        ${assessment.recommendation}
                    </p>

                    <p>
                        <strong>Impacted Metrics:</strong>
                        ${assessment.impacted_metrics}
                    </p>

                    <p>
                        <strong>Risks:</strong>
                        ${assessment.risks}
                    </p>

                </div>
            `
        ).join("");

    } catch (error) {

        console.error(
            "Assessment loading error:",
            error
        );

        alert("Unable to load saved assessments.");
    }
}