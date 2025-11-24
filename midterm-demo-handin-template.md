# Mid-term Demo - M7011E

**Group Number**:  
**Team Members**: Rasmus Kebert, Viggo Härdelin, Olle Göransson,
**Date**: 24/11-2025

---

## Instructions
Mandatory Non-graded checkpoint. Be honest about your progress - we're here to help. You'll submit this template and do a brief demo of your deployed system.

---

## Part 1: Technical Infrastructure

### Repository & CI/CD
- [ ] Git repository or repositories (if multirepo, use git org) with all members contributing
  - **Repo URL**: 
  - https://github.com/K4ffeMan/m7011e
  - https://github.com/Kebertr/m7011e-gitops

- [ ] GitOps CI pipeline functional
  - **Link**: [.github/workflows]
  - **Status**: [ Builds + tests some parts but not all ]

- [ Configured for backend and database, deploying autocmatically for frontend] ArgoCD setup for GitOps deployment (CD)
  - **Status**: [ Configured ]
### Kubernetes Deployment
- [ backend, database, frontend] Services deployed to K3s cluster
  - **Services deployed**: backend, frontend, database
  - **Public URL(s):**: 
  - https://database.ltu-m7011e-7.se/
  - https://frontend-dev.ltu-m7011e-7.se/

- [Working ] HTTPS with certificates working
  - **Status**: [Working]

- [ Not started] Monitoring/Observability setup
  - **Status**: [Not started ]

### Backend Services
- [ No microservice implemented, have mainly started with basic things like eslint and prettier format. Will begin with keycloak before        microservices ] Microservices architecture implemented


- [Started ] Database deployed and accessible
  - **Type**: [PostgreSQL]
  - **Schema**: https://github.com/K4ffeMan/m7011e/blob/main/database/database-schema.md

- [ REST] Inter-service communication method
  - **Approach**: [Not started]

### Testing
- [ Not measured yet ] Backend tests written
  - **Link**: [test files]
  - **Coverage estimate**: [X%] or "Not measured yet"

### Frontend
- [ ] Frontend framework deployed
  - **Framework**: [React]
  - **Public URL**: https://frontend-dev.ltu-m7011e-7.se/
  - **Status**: [Basic structure]

### Security & Auth
- [ Not started ] Keycloak integration status
  - **Status**: [Not started]

---

## Part 2: Feature Implementation

List your main features and current status:

1. Private rooms
   - Status: [In progress]
   - Can demo: No

2. Weighted-voting
   - Status: [Not started]
   - Can demo: No

3. Watch-together
   - Status: [Not started]
   - Can demo: No

4. Recommended/save history
   - Status: [Not started]
   - Can demo: No

---

## Part 3: Self-Assessment

**Overall progress:**
- [ ] Ahead of schedule
- [ ] On track
- [x] Slightly behind but manageable
- [ ] Significantly behind - need help

**What's working well:**
The work load is very evenly divided between everyone in the group and the communication between group memebers is very good. 

**Biggest blocker so far:**
Going through the tutorials. 

**What would help most:**
More man hours in the project, currently we have been putting more hours in our other courses but this is also something that we planned for. 

**Team dynamics:**
- Contact Casper if there is problems with team dynamics or conflicts arise that you can't solve within the group.

---

## Part 4: Demo Preparation

**For your live demo, prepare to show:**
- Your deployed system running (visit your public URL(s))
- One working feature end-to-end
- Your ArgoCD dashboard and deployment status (If applicable)
- Database schema and explain one design choice (To practice for the final seminar)

**Questions you should be ready to answer:**
- How does GitOps deployment work in your setup? (Or the plan if not ready yet)
- Explain your microservices architecture (Current status, planned architecture, any changes from the proposal)
- What's your next implementation priority?
