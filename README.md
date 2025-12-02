# m7011e


## Frontend generates with vite 

To run the frontend: 

```
cd frontend
npm run dev
``` 

## Tesing the project 
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
pytest testing-ci/frontend-tests/fetest.py
pytest testing-ci/backend-tests/betest.py
```
To test the frontend/backend