import axios from "axios";

export async function getAccessToken() {
  const response = await axios.post(
    "https://keycloak-dev.ltu-m7011e-7.se/realms/user/protocol/openid-connect/token",
    new URLSearchParams({
      grant_type: "password",
      client_id: "frontend-dev",
      username: process.env.KEYCLOAK_TEST_USER!,
      password: process.env.KEYCLOAK_TEST_PASSWORD!,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}
