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

for windows:
```
.\.venvs\playwright\Scripts\Activate.ps1
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

# Rabbitmq
To test it. Start with 
```
kubectl port-forward -n rabbitmq-dev svc/rabbitmq-service-management 15672:15672
kubectl port-forward -n rabbitmq-dev svc/rabbitmq-service-api 5672:5672
```

Go to http://localhost:15672/#/

Go into venv


Once(dependency):
```
pip install pika
```
Go into testing-ci/rabbitmq-tests
```
python consumer.py
python producer.py
```

When using rabbitmq for backend when running inside kubernetess, we change 'localhost' to rabbitmq-service-api
## How CI and workflow works 

Currently the CI runs on ubuntu (which is slow). The reason why we currently do not run tests inside a custom alpine docker image is because playwright does not have official support for running alpine linux since it uses glibc while alpine uses libc which are incompatible. There are workarounds for this that we might explore later. 


How it works now is that the CI starts running the lint which pulls the the repository, setups python and then install flak8 (python linter) and then runs flake8 in the entire repository. 
