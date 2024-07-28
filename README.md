# Project README
## Pre-requisites:

**Create an env file inside of the cirrostrats-frontend folder :**

   Create new file and name it '.env'
   paste the following inside of this `.env` file.
    # .env (for local environment)
    REACT_APP_API_URL=http://127.0.0.1:8000
## Running the Project


### Can be spooled up by using one of two ways:

## With Docker - Docker container(spools up frontend, backend and nginx):
1. **Clone the base repo:f** https://github.com/Cirrostrats/base

2. **Clone backend and the frontend(this project) repos within the base repo**
   **The backend for this project is at the following repo :**
   https://github.com/ujazishere/cirrostrats-backend/


4. **Run docker compose command to build and run the container:**

   ```docker-compose up --build```

5. **Access the Frontend:** The frontend runs on [http://localhost:5173/](http://localhost:5173/).


## Without Docker(Just frontend):

1. **Running the Frontend:**

   install the dependinces
   a. \*\*run npm install

   b. **Run Development Server:**

   ```bash
   npm run dev
   ```

   c. **Access the Frontend:** The frontend runs on [http://localhost:5173/](http://localhost:5173/).

   d. **The backend for this project is at the following repo :**
   https://github.com/ujazishere/cirrostrats-backend/



dev notes:
Ensure following code is within package.json to allow other networks/containers to listen to the project when running the project on an isolated container.
  "scripts": {
    "dev": "vite --host 0.0.0.0",