# m7011e


## Frontend generates with vite 

To run the frontend: 

```
cd frontend
npm run dev
``` 

## Testing the project 
Start frontend/backend:
```
/frontend npm run dev
/backend npm run dev
```

Enter venv mode
```
source ~/.venvs/playwright/bin/activate
```
Then it should look something like: (playwright) m7011e >
Then run:
```
pytest testing-ci/frontend-tests/test_fe.py
pytest testing-ci/backend-tests/test_be.py
```
To test the frontend/backend

# keycloak
For running locally:
Easiest way is with docker
docker compose up --build in root folder

The login and register button is now connected to keycloaks register and login. This ensures that we take full advantage of keycloak, since they do every login for us and gives a jws token back.
