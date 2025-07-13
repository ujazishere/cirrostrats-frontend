# One of two ways to do this:
**A: Docker container(spools up frontend, backend and nginx using docker:) - Most efficient and Full-Featured:**

**OR**

**B: Without docker(Spool up just the frontend) - React JS**


## A: Docker container(spools up frontend, backend and nginx using docker:) - Most efficient and Full-Featured:

1. **Clone the base repo:** [https://github.com/Cirrostrats/base](https://github.com/Cirrostrats/base)

2. **Follow instructions in `base/README.md`**

## B: Without docker(Spool up just the frontend) - React JS**

**Create an `.env` file inside of the `cirrostrats-frontend` folder :**
**Paste the following inside of frontend's `.env` file.**

   ```bash
      # Backend api for local backend - When working on backend too and have local backend project
      VITE_API_URL=http://127.0.0.1:8000
      # Backend api for beta -- use when only need to work on frontend - this fetches backend data from beta server.
      VITE_API_URL=https://beta.cirrostrats.us/api
      # Backend api - Use this for production when using nginx and such on aws instance with backend and frontend service running.
      # VITE_API_URL=/api

      # Currently used to avoid flightawarefetches:
      VITE_ENV=dev
      VITE_APP_AVOID_FLIGHT_AWARE=true
      
      # EDCT fetches(DO NOT USE IN DEV TO AVOID UNNECESSARY PROCESSING):
      # VITE_EDCT_FETCH=1

      # Test backend data
      # Set to true for returning test data on search - Good for efficient frontend dev(faster load times).
      # Set to false if requesting actual data from backend(slower load times).
      VITE_APP_TEST_FLIGHT_DATA=true
      
      # Use this to save searches to mongoDB. Desiged for production only. DO NOT USE LOCALLY!
      # VITE_TRACK_SEARCH=true
   ```

1. **Running the Frontend:**

   a. **Install the dependinces - run `npm install`**

   b. **Run Development Server:**

   ```bash
   npm run dev
   ```

   c. **Access the Frontend:** The frontend runs on [http://localhost:5173/](http://localhost:5173/).

   d. **The backend for this project is at the following repo :**
   https://github.com/ujazishere/cirrostrats-backend/


**dev notes:**
Ensure following code is within package.json to allow other networks/containers to listen to the project when running the project on an isolated container.
```bash
  "scripts": {
    "dev": "vite --host 0.0.0.0",
```