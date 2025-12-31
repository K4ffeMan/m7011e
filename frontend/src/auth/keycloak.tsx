import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'https://keycloak-dev.ltu-m7011e-7.se',  // Change to your Keycloak URL
    realm: 'user',                                // Your realm name
    clientId: 'frontend-dev'
});

export default keycloak;