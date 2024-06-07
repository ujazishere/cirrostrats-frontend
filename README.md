# Project README

## Running the Project

### Frontend

1. **Running the Frontend:**

   install the dependinces
   a. \*\*run npm install

   b. **Run Development Server:**

   ```bash
   npm run dev
   ```

   c. **Access the Frontend:** The frontend runs on [http://localhost:5173/](http://localhost:5173/).

   d. **The backend for this project is at the following repo :**
   https://github.com/luisarevalo21/cirrostrats-backend



dev notes:
Ensure following code is within package.json to allow other networks/containers to listen to the project when running the project on an isolated container.
  "scripts": {
    "dev": "vite --host 0.0.0.0",