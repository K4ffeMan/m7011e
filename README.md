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

## How CI and workflow works 

Currently the CI runs on ubuntu (which is slow). The reason why we currently do not run tests inside a custom alpine docker image is because playwright does not have official support for running alpine linux since it uses glibc while alpine uses libc which are incompatible. There are workarounds for this that we might explore later. 


How it works now is that the CI starts running the lint which pulls the the repository, setups python and then install flak8 (python linter) and then runs flake8 in the entire repository. 

After the lint is finished it will start the backend tests (that are dependent on lint), it starts with choosing a base url, setting up node.js and installing dependencies with npm. After this is done it mock starts the backend server using ```npm run dev```. Then it setups python to make sure it is the correct version and install it's dependencies (full dependency list can be found in testing-ci/requirements.txt) and then finishes by actually running the backend tests and then uploads the results. 

The frontend job works very much the same as the backend job which some differences to make it running. The steps the frontend job takes are: node.js setup and then caches them between ci runs to make this testing a bit more performance optimized. Then it installs the frontend dependencies in the same manner. Then it starts the frontend  and then setup python for playwright. Lastly the job runs the frontend test file and uploads the results. 