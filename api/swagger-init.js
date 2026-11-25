window.onload = async function () {
    const error = document.getElementById("load-error");

    if (typeof SwaggerUIBundle !== "function") {
        error.hidden = false;
        return;
    }

    try {
        const response = await fetch("./openapi.bundle.json");
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        window.ui = SwaggerUIBundle({
            spec: await response.json(),
            dom_id: "#swagger-ui",
            deepLinking: true,
            validatorUrl: null,
            persistAuthorization: false,
            withCredentials: false,
            docExpansion: "list",
            displayRequestDuration: true
        });
    } catch {
        error.hidden = false;
    }
};
