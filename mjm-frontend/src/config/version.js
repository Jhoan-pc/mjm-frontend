// Metadatos automáticos de versión, build y fecha de último despliegue (Publish)
export const BUILD_INFO = {
  version: '2.4',
  engine: 'MJM Engine v2.4',
  publishDate: typeof __APP_PUBLISH_TIME__ !== 'undefined' 
    ? __APP_PUBLISH_TIME__ 
    : new Date().toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
  commitHash: typeof __APP_COMMIT_HASH__ !== 'undefined' ? __APP_COMMIT_HASH__ : 'a082fcb'
};
