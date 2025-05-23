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
      # .env (for local environment)
      VITE_API_URL=http://127.0.0.1:8000
      VITE_ENV=dev
      # .env (for production/AWS environment) Use this for production. Comment it out on local machine
      # VITE_API_URL=/api
      
      # Set it to true for returning test data on search - Good for efficient frontend dev. Set to false if requesting actual data.
      VITE_APP_TEST_FLIGHT_DATA=false
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