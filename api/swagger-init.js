/* Swagger UI 5.32.0; config: https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/ */
if (typeof SwaggerUIBundle !== 'function') {
  document.getElementById('load-error').hidden = false;
} else {
  window.ui = SwaggerUIBundle({
    url: './openapi.bundle.json',
    dom_id: '#swagger-ui',
    deepLinking: true,
    validatorUrl: null,
    persistAuthorization: false,
    withCredentials: false,
    docExpansion: 'list',
    displayRequestDuration: true,
    onFailure: function () {
      document.getElementById('load-error').hidden = false;
    }
  });
}
